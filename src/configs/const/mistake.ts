import { MistakeStatus, MistakeType } from "@/generated/prisma/enums";

export const MISTAKE_DEFAULT_PAGE_SIZE = 10;
export const MISTAKE_MAX_PAGE_SIZE = 50;
export const MAX_UPLOADS_PER_REQUEST = 10;
export const MAX_UPLOAD_SIZE_BYTES = 5 * 1024 * 1024;
export const MISTAKE_TYPE_VALUES = [
  MistakeType.CONCEPTUAL,
  MistakeType.SILLY,
  MistakeType.CALCULATION,
  MistakeType.MISREAD,
  MistakeType.UNKNOWN,
] as const;

export const MISTAKE_STATUS_VALUES = [
  MistakeStatus.NEW,
  MistakeStatus.REVIEWING,
  MistakeStatus.MASTERED,
  MistakeStatus.ARCHIVED,
] as const;

export const MISTAKE_VIEW_SELECT = {
  id: true,
  type: true,
  description: true,
  topic: true,
  confidence: true,
  status: true,
  createdAt: true,
  analysisRun: {
    select: {
      id: true,
      modelVersion: true,
      status: true,
      createdAt: true,
      attachment: {
        select: {
          id: true,
          publicUrl: true,
          mimeType: true,
        },
      },
    },
  },
} as const;
