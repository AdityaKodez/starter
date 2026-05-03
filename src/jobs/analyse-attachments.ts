import { GetObjectCommand } from "@aws-sdk/client-s3";
import { NonRetriableError, type GetStepTools } from "inngest";

import { GOOGLE_MODEL } from "@/lib/ai";
import { attachmentProcessingChannel } from "@/lib/attachment-processing-realtime";
import { getAttachmentBucket } from "@/lib/attachment-upload";
import { inngest } from "@/lib/inngest";
import { prisma } from "@/lib/prisma";
import { s3 } from "@/lib/s3";
import { analyseDocumentNatively } from "@/services/analyse-chunks";

type Step = GetStepTools<typeof inngest>;

const MODEL_VERSION = `${GOOGLE_MODEL}+textract-v1`;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function getProcessingErrorMessage(error: unknown) {
  if (error instanceof Error && error.message.trim()) {
    return error.message;
  }

  return "Attachment processing failed.";
}

async function publishStatus(
  step: Step,
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

  try {
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
  } catch (error) {
    console.error("Failed to publish attachment processing status", {
      attachmentId: input.attachmentId,
      status: input.status,
      error,
    });
  }
}

async function markFailed(input: {
  attachmentId: string;
  userId: string;
  step: Step;
  error: unknown;
}) {
  const message = getProcessingErrorMessage(input.error);

  await input.step.run(`mark-failed-${input.attachmentId}`, async () => {
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

  await publishStatus(input.step, {
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

// ---------------------------------------------------------------------------
// Main Inngest function
// ---------------------------------------------------------------------------

export const processAttachment = inngest.createFunction(
  {
    id: "process-attachment",
    retries: 2,
    triggers: [{ event: "attachment/processing.requested" }],
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
      let result: Record<string, unknown> | undefined;

      try {
        result = await step.invoke(`process-attachment-${attachmentId}`, {
          function: processOneAttachmentFn,
          data: { attachmentId, userId },
          timeout: "5m",
        });
      } catch (error) {
        if (error instanceof NonRetriableError) {
          result = {
            skipped: true,
            failed: true,
            attachmentId,
            errorMessage: error.message,
          };
        } else {
          result = {
            skipped: false,
            failed: true,
            attachmentId,
            errorMessage:
              error instanceof Error ? error.message : "Unknown error",
          };
        }
      }

      results.push(result);
    }

    return { processed: results.length, results };
  },
);

// ---------------------------------------------------------------------------
// Per-attachment pipeline (separate Inngest function for step.invoke)
// ---------------------------------------------------------------------------

export const processOneAttachmentFn = inngest.createFunction(
  {
    id: "process-one-attachment",
    retries: 2,
    triggers: [{ event: "attachment/single.processing.requested" }],
  },
  async ({ event, step }) => {
    const attachmentId = event.data.attachmentId as string;
    const userId = event.data.userId as string;

    try {
      return await processOneAttachment({ attachmentId, userId, step });
    } catch (error) {
      return markFailed({ attachmentId, userId, step, error });
    }
  },
);

async function processOneAttachment(input: {
  attachmentId: string;
  userId: string;
  step: Step;
}) {
  const { attachmentId, userId, step } = input;

  // ── Step 1: Prepare the AnalysisRun ──────────────────────────────────
  const setup = await step.run(`prepare-run-${attachmentId}`, async () => {
    const attachment = await prisma.attachment.findFirst({
      where: {
        id: attachmentId,
        userId,
        status: "UPLOADED",
      },
    });

    if (!attachment) {
      return {
        skipped: true as const,
        reason: "attachment-not-found-or-not-uploaded",
      };
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

  // ── Step 2: Download file from S3 ─────────────────────────────────────────
  await publishStatus(step, {
    attachmentId,
    status: "ANALYZING",
    message: "Downloading file",
    stepName: "downloading",
  });

  const bucket = getAttachmentBucket();

  if (!bucket) {
    throw new Error("Missing S3 bucket configuration.");
  }

  const base64File = await step.run(`download-${attachmentId}`, async () => {
    const { Body } = await s3.send(
      new GetObjectCommand({
        Bucket: bucket,
        Key: setup.attachment.storageKey,
      })
    );
    if (!Body) throw new Error("No body from S3");
    const arr = await Body.transformToByteArray();
    return Buffer.from(arr).toString("base64");
  });

  // ── Step 3: AI analysis natively ───────────────
  await publishStatus(step, {
    attachmentId,
    status: "ANALYZING",
    message: "Analyzing document with Gemini",
    stepName: "analyzing",
  });

  const mistakeCount = await step.run(
    `analyse-natively-${attachmentId}`,
    async () => {
      await prisma.analysisRun.update({
        where: { id: setup.analysisRunId },
        data: { status: "ANALYZING" },
      });

      const mistakes = await analyseDocumentNatively({
        buffer: Buffer.from(base64File, "base64"),
        mimeType: setup.attachment.mimeType,
      });

      if (mistakes.length > 0) {
        await prisma.mistake.createMany({
          data: mistakes.map((mistake) => ({
            analysisRunId: setup.analysisRunId,
            type: mistake.type,
            description: mistake.description,
            topic: mistake.topic,
            confidence: mistake.confidence,
          })),
        });
      }

      return mistakes.length;
    },
  );

  // ── Step 4: Mark complete ────────────────────────────────────────────
  await step.run(`complete-analysis-${attachmentId}`, async () => {
    return prisma.analysisRun.update({
      where: { id: setup.analysisRunId },
      data: {
        status: "COMPLETED",
        completedAt: new Date(),
      },
    });
  });

  await publishStatus(step, {
    attachmentId,
    status: "COMPLETED",
    message: "Processing complete",
    stepName: "completed",
    chunkCount: 1,
    pageCount: 1,
  });

  return {
    skipped: false as const,
    attachmentId,
    analysisRunId: setup.analysisRunId,
    chunkCount: 1,
    mistakeCount,
  };
}


