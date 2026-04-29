import "server-only";

import {
  DetectDocumentTextCommand,
  GetDocumentTextDetectionCommand,
  StartDocumentTextDetectionCommand,
  type Block,
} from "@aws-sdk/client-textract";

import { textract } from "@/lib/textract";

export async function detectImageText(input: {
  bucket: string;
  key: string;
}): Promise<Block[]> {
  const result = await textract.send(
    new DetectDocumentTextCommand({
      Document: {
        S3Object: {
          Bucket: input.bucket,
          Name: input.key,
        },
      },
    }),
  );

  return result.Blocks ?? [];
}

export async function startDocumentTextDetection(input: {
  bucket: string;
  key: string;
}): Promise<string> {
  const result = await textract.send(
    new StartDocumentTextDetectionCommand({
      DocumentLocation: {
        S3Object: {
          Bucket: input.bucket,
          Name: input.key,
        },
      },
    }),
  );

  if (!result.JobId) {
    throw new Error("Textract did not return a JobId.");
  }

  return result.JobId;
}

export async function getDocumentTextDetectionPage(input: {
  jobId: string;
  nextToken?: string;
}) {
  const result = await textract.send(
    new GetDocumentTextDetectionCommand({
      JobId: input.jobId,
      NextToken: input.nextToken,
    }),
  );

  return {
    blocks: result.Blocks ?? [],
    nextToken: result.NextToken,
    jobStatus: result.JobStatus,
  };
}

export function getTextLines(blocks: Block[]) {
  return blocks
    .filter((block) => block.BlockType === "LINE" && block.Text)
    .map((block) => ({
      id: block.Id,
      text: block.Text ?? "",
      page: block.Page ?? 1,
      confidence: block.Confidence,
      geometry: block.Geometry,
    }));
}

export function getFullText(blocks: Block[]) {
  return getTextLines(blocks)
    .map((line) => line.text)
    .join("\n");
}

export function getPageCount(blocks: Block[]) {
  return blocks.reduce((pageCount, block) => {
    return Math.max(pageCount, block.Page ?? 0);
  }, 0);
}

export function isSupportedImageMimeType(mimeType: string) {
  return ["image/jpeg", "image/jpg", "image/png"].includes(
    mimeType.toLowerCase(),
  );
}

export function isPdfMimeType(mimeType: string) {
  return mimeType.toLowerCase() === "application/pdf";
}
