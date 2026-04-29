import type { Block } from "@aws-sdk/client-textract";
import type { Prisma } from "@/generated/prisma/client";
import type { Realtime } from "inngest/realtime";

import { attachmentProcessingChannel } from "@/lib/attachment-processing-realtime";
import { getAttachmentBucket } from "@/lib/attachment-upload";
import { inngest } from "@/lib/inngest";
import { prisma } from "@/lib/prisma";
import { buildDocumentChunks } from "@/utils/document-chunking";
import {
  detectImageText,
  getDocumentTextDetectionPage,
  getFullText,
  getPageCount,
  isPdfMimeType,
  isSupportedImageMimeType,
  startDocumentTextDetection,
} from "@/utils/text-extraction";

const MODEL_VERSION = "textract-detect-document-text-v1";
const TEXTRACT_POLL_INTERVAL = "15s";
const MAX_TEXTRACT_POLLS = 80;

type InngestStep = {
  run: <T>(id: string, handler: () => Promise<T> | T) => Promise<unknown>;
  sleep: (id: string, duration: string) => Promise<void>;
  realtime: {
    publish: <TData>(
      id: string,
      topicRef: Realtime.TopicRef<TData>,
      data: TData,
    ) => Promise<TData>;
  };
};

async function runStep<T>(
  step: InngestStep,
  id: string,
  handler: () => Promise<T> | T,
) {
  return (await step.run(id, handler)) as T;
}

function toJson(value: unknown) {
  return JSON.parse(JSON.stringify(value)) as Prisma.InputJsonValue;
}

function getProcessingErrorMessage(error: unknown) {
  if (error instanceof Error && error.message.trim()) {
    return error.message;
  }

  return "Attachment processing failed.";
}

async function publishAttachmentStatus(
  step: InngestStep,
  input: {
    attachmentId: string;
    status:
      | "QUEUED"
      | "OCR_PROCESSING"
      | "OCR_COMPLETED"
      | "CHUNKING"
      | "ANALYZING"
      | "COMPLETED"
      | "FAILED";
    message: string;
    stepName: string;
    chunkCount?: number;
    pageCount?: number;
    errorMessage?: string;
  },
) {
  const channel = attachmentProcessingChannel({
    attachmentId: input.attachmentId,
  });

  await step.realtime.publish(
    `attachment-${input.attachmentId}-${input.stepName}`,
    channel.status,
    {
      attachmentId: input.attachmentId,
      status: input.status,
      message: input.message,
      step: input.stepName,
      chunkCount: input.chunkCount,
      pageCount: input.pageCount,
      errorMessage: input.errorMessage,
    },
  );
}

async function publishAttachmentStatusSafely(
  step: InngestStep,
  input: Parameters<typeof publishAttachmentStatus>[1],
) {
  try {
    await publishAttachmentStatus(step, input);
  } catch (error) {
    console.error("Failed to publish attachment processing status", {
      attachmentId: input.attachmentId,
      status: input.status,
      error,
    });
  }
}

async function markAttachmentProcessingFailed(input: {
  attachmentId: string;
  userId: string;
  step: InngestStep;
  error: unknown;
}) {
  const message = getProcessingErrorMessage(input.error);

  await runStep(input.step, `mark-failed-${input.attachmentId}`, async () => {
    const run =
      (await prisma.analysisRun.findFirst({
        where: {
          attachmentId: input.attachmentId,
          attachment: { userId: input.userId },
          status: { notIn: ["COMPLETED", "FAILED"] },
        },
        orderBy: { createdAt: "desc" },
      })) ??
      (await prisma.analysisRun.create({
        data: {
          attachmentId: input.attachmentId,
          modelVersion: MODEL_VERSION,
          status: "FAILED",
          errorMessage: message,
          completedAt: new Date(),
        },
      }));

    if (run.status === "FAILED") {
      return run;
    }

    return prisma.analysisRun.update({
      where: { id: run.id },
      data: {
        status: "FAILED",
        errorMessage: message,
        completedAt: new Date(),
      },
    });
  });

  await publishAttachmentStatusSafely(input.step, {
    attachmentId: input.attachmentId,
    status: "FAILED",
    message: "Processing failed",
    stepName: "failed",
    errorMessage: message,
  });

  return {
    skipped: false as const,
    failed: true as const,
    attachmentId: input.attachmentId,
    errorMessage: message,
  };
}

export const processAttachment = inngest.createFunction(
  {
    id: "process-attachment",
    retries: 2,
    triggers: { event: "attachment/processing.requested" },
  },
  async ({ event, step }) => {
    const attachmentIds = Array.from(
      new Set((event.data.attachmentIds ?? []) as string[]),
    );
    const userId = event.data.userId as string | undefined;

    if (!userId || attachmentIds.length === 0) {
      return { processed: 0, skipped: attachmentIds.length };
    }

    const results = [];

    for (const attachmentId of attachmentIds) {
      try {
        const result = await processOneAttachment({
          attachmentId,
          userId,
          step,
        });
        results.push(result);
      } catch (error) {
        const result = await markAttachmentProcessingFailed({
          attachmentId,
          userId,
          step,
          error,
        });
        results.push(result);
      }
    }

    return { processed: results.length, results };
  },
);

async function processOneAttachment(input: {
  attachmentId: string;
  userId: string;
  step: InngestStep;
}) {
  const { attachmentId, userId, step } = input;

  const setup = await runStep(step, `prepare-run-${attachmentId}`, async () => {
    const attachment = await prisma.attachment.findFirst({
      where: {
        id: attachmentId,
        userId,
        status: "UPLOADED",
      },
    });

    if (!attachment) {
      return { skipped: true as const, reason: "attachment-not-found-or-not-uploaded" };
    }

    const completedRun = await prisma.analysisRun.findFirst({
      where: {
        attachmentId,
        status: "COMPLETED",
      },
      orderBy: { createdAt: "desc" },
    });

    if (completedRun) {
      return { skipped: true as const, reason: "already-completed" };
    }

    const activeRun =
      (await prisma.analysisRun.findFirst({
        where: {
          attachmentId,
          status: { notIn: ["COMPLETED", "FAILED"] },
        },
        orderBy: { createdAt: "desc" },
      })) ??
      (await prisma.analysisRun.create({
        data: {
          attachmentId,
          modelVersion: MODEL_VERSION,
          status: "QUEUED",
        },
      }));

    const run = await prisma.analysisRun.update({
      where: { id: activeRun.id },
      data: {
        status: "OCR_PROCESSING",
        errorMessage: null,
        startedAt: activeRun.startedAt ?? new Date(),
      },
    });

    return {
      skipped: false as const,
      attachment,
      analysisRunId: run.id,
    };
  });

  if (setup.skipped) {
    return setup;
  }

  await publishAttachmentStatusSafely(step, {
    attachmentId,
    status: "OCR_PROCESSING",
    message: "Reading text with Textract",
    stepName: "ocr-processing",
  });

  const bucket = getAttachmentBucket();

  if (!bucket) {
    throw new Error("Missing S3 bucket configuration.");
  }

  const blocks = await runTextractForAttachment({
    attachmentId,
    bucket,
    key: setup.attachment.storageKey,
    mimeType: setup.attachment.mimeType,
    analysisRunId: setup.analysisRunId,
    step,
  });

  const ocrSummary = await runStep(step, `store-ocr-${attachmentId}`, async () => {
    const pageCount = getPageCount(blocks);

    return prisma.analysisRun.update({
      where: { id: setup.analysisRunId },
      data: {
        status: "OCR_COMPLETED",
        rawOcr: toJson(blocks),
        fullText: getFullText(blocks),
        pageCount,
      },
      select: {
        pageCount: true,
      },
    });
  });

  await publishAttachmentStatusSafely(step, {
    attachmentId,
    status: "OCR_COMPLETED",
    message: "OCR text extracted",
    stepName: "ocr-completed",
    pageCount: ocrSummary.pageCount ?? undefined,
  });

  await publishAttachmentStatusSafely(step, {
    attachmentId,
    status: "CHUNKING",
    message: "Preparing OCR text chunks",
    stepName: "chunking",
    pageCount: ocrSummary.pageCount ?? undefined,
  });

  const chunks = await runStep(step, `chunk-ocr-${attachmentId}`, async () => {
    await prisma.analysisRun.update({
      where: { id: setup.analysisRunId },
      data: { status: "CHUNKING" },
    });

    const documentChunks = buildDocumentChunks({
      attachmentId,
      analysisRunId: setup.analysisRunId,
      blocks,
    });

    await prisma.documentChunk.deleteMany({
      where: { analysisRunId: setup.analysisRunId },
    });

    if (documentChunks.length > 0) {
      await prisma.documentChunk.createMany({
        data: documentChunks.map((chunk) => ({
          attachmentId: chunk.attachmentId,
          analysisRunId: chunk.analysisRunId,
          chunkIndex: chunk.chunkIndex,
          pageStart: chunk.pageStart,
          pageEnd: chunk.pageEnd,
          text: chunk.text,
          sourceBlockIds: chunk.sourceBlockIds,
          confidence: chunk.confidence,
          needsVision: chunk.needsVision,
        })),
      });
    }

    return documentChunks.length;
  });

  await publishAttachmentStatusSafely(step, {
    attachmentId,
    status: "ANALYZING",
    message: "Ready for model analysis",
    stepName: "analyzing",
    chunkCount: chunks,
    pageCount: ocrSummary.pageCount ?? undefined,
  });

  await runStep(step, `complete-analysis-${attachmentId}`, async () => {
    return prisma.analysisRun.update({
      where: { id: setup.analysisRunId },
      data: {
        status: "COMPLETED",
        completedAt: new Date(),
      },
    });
  });

  await publishAttachmentStatusSafely(step, {
    attachmentId,
    status: "COMPLETED",
    message: "Processing complete",
    stepName: "completed",
    chunkCount: chunks,
    pageCount: ocrSummary.pageCount ?? undefined,
  });

  return {
    skipped: false as const,
    attachmentId,
    analysisRunId: setup.analysisRunId,
    chunks,
  };
}

async function runTextractForAttachment(input: {
  attachmentId: string;
  bucket: string;
  key: string;
  mimeType: string;
  analysisRunId: string;
  step: InngestStep;
}) {
  if (isSupportedImageMimeType(input.mimeType)) {
    return runStep(input.step, `detect-image-text-${input.attachmentId}`, async () => {
      return detectImageText({
        bucket: input.bucket,
        key: input.key,
      });
    });
  }

  if (!isPdfMimeType(input.mimeType)) {
    throw new Error(`Unsupported attachment MIME type: ${input.mimeType}`);
  }

  const jobId = await runStep(
    input.step,
    `start-pdf-text-detection-${input.attachmentId}`,
    async () => {
      const textractJobId = await startDocumentTextDetection({
        bucket: input.bucket,
        key: input.key,
      });

      await prisma.analysisRun.update({
        where: { id: input.analysisRunId },
        data: { textractJobId },
      });

      return textractJobId;
    },
  );

  for (let attempt = 1; attempt <= MAX_TEXTRACT_POLLS; attempt += 1) {
    await input.step.sleep(
      `wait-for-textract-${input.attachmentId}-${attempt}`,
      TEXTRACT_POLL_INTERVAL,
    );

    const status = await runStep(
      input.step,
      `poll-textract-${input.attachmentId}-${attempt}`,
      async () => {
        const page = await getDocumentTextDetectionPage({ jobId });
        return page.jobStatus;
      },
    );

    if (status === "SUCCEEDED") {
      return runStep(input.step, `fetch-textract-results-${input.attachmentId}`, async () => {
        const blocks: Block[] = [];
        let nextToken: string | undefined;

        do {
          const page = await getDocumentTextDetectionPage({
            jobId,
            nextToken,
          });

          blocks.push(...page.blocks);
          nextToken = page.nextToken;
        } while (nextToken);

        return blocks;
      });
    }

    if (status === "FAILED" || status === "PARTIAL_SUCCESS") {
      throw new Error(`Textract text detection ended with status: ${status}.`);
    }
  }

  throw new Error("Timed out waiting for Textract text detection.");
}
