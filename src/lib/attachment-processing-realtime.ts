import { realtime } from "inngest";
import { z } from "zod";

export const attachmentProcessingStatuses = [
  "UPLOADED",
  "QUEUED",
  "OCR_PROCESSING",
  "OCR_COMPLETED",
  "CHUNKING",
  "ANALYZING",
  "COMPLETED",
  "FAILED",
] as const;

export const attachmentProcessingChannel = realtime.channel({
  name: ({ attachmentId }: { attachmentId: string }) =>
    `attachment-processing:${attachmentId}`,
  topics: {
    status: {
      schema: z.object({
        attachmentId: z.string(),
        status: z.enum(attachmentProcessingStatuses),
        message: z.string(),
        step: z.string(),
        chunkCount: z.number().int().optional(),
        pageCount: z.number().int().optional(),
        errorMessage: z.string().optional(),
      }),
    },
  },
});

export type AttachmentProcessingStatus =
  (typeof attachmentProcessingStatuses)[number];
