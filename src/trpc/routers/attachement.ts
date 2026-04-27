import { createId } from "@paralleldrive/cuid2";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

import {
  createAttachmentUploadUrl,
  getAttachmentBucket,
  getAttachmentStorageKey,
  getPublicUrl,
} from "@/lib/attachment-upload";
import { prisma } from "@/lib/prisma";

import { authedProcedure, createTRPCRouter } from "../init";

const MAX_UPLOADS_PER_REQUEST = 10;
const MAX_UPLOAD_SIZE_BYTES = 25 * 1024 * 1024;

const uploadFileInputSchema = z.object({
  fileName: z.string().trim().min(1).max(255),
  mimeType: z.string().trim().min(1).max(255),
  sizeBytes: z.number().int().min(1).max(MAX_UPLOAD_SIZE_BYTES).optional(),
});

function getAttachmentType(mimeType: string) {
  if (mimeType.startsWith("image/")) {
    return "IMAGE" as const;
  }

  if (mimeType === "application/pdf") {
    return "PDF" as const;
  }

  throw new TRPCError({
    code: "BAD_REQUEST",
    message: "Only image and PDF attachments are supported.",
  });
}

export const attachementRouter = createTRPCRouter({
  prepareUploads: authedProcedure
    .input(
      z.object({
        files: z
          .array(uploadFileInputSchema)
          .min(1)
          .max(MAX_UPLOADS_PER_REQUEST),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      if (!getAttachmentBucket()) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Missing S3 bucket configuration.",
        });
      }

      const uploads = await Promise.all(
        input.files.map(async (file) => {
          const attachmentId = createId();
          const storageKey = getAttachmentStorageKey({
            attachmentId,
            userId: ctx.user.id,
            fileName: file.fileName,
          });
          const publicUrl = getPublicUrl(storageKey);
          const uploadUrl = await createAttachmentUploadUrl({
            storageKey,
            contentType: file.mimeType,
          });

          return {
            attachmentId,
            uploadUrl,
            publicUrl,
            storageKey,
            file,
            type: getAttachmentType(file.mimeType),
          };
        }),
      );

      await prisma.mistakeAttachment.createMany({
        data: uploads.map((upload) => ({
          id: upload.attachmentId,
          type: upload.type,
          uploadStatus: "PENDING",
          storageKey: upload.storageKey,
          fileName: upload.file.fileName,
          mimeType: upload.file.mimeType,
          sizeBytes: upload.file.sizeBytes,
          publicUrl: upload.publicUrl,
          userId: ctx.user.id,
        })),
      });

      return uploads.map((upload) => ({
        attachmentId: upload.attachmentId,
        uploadUrl: upload.uploadUrl,
        publicUrl: upload.publicUrl,
      }));
    }),

  markUploaded: authedProcedure
    .input(
      z.object({
        attachmentIds: z.array(z.string().min(1)).min(1).max(MAX_UPLOADS_PER_REQUEST),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const attachmentIds = Array.from(new Set(input.attachmentIds));
      const attachments = await prisma.mistakeAttachment.findMany({
        where: {
          id: { in: attachmentIds },
          userId: ctx.user.id,
        },
        select: {
          id: true,
          uploadStatus: true,
          mistakeId: true,
        },
      });

      if (attachments.length !== attachmentIds.length) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "One or more attachments were not found.",
        });
      }

      const invalidAttachment = attachments.find(
        (attachment) =>
          attachment.uploadStatus !== "PENDING" || attachment.mistakeId !== null,
      );

      if (invalidAttachment) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Only pending, unattached uploads can be marked uploaded.",
        });
      }

      await prisma.mistakeAttachment.updateMany({
        where: {
          id: { in: attachmentIds },
          userId: ctx.user.id,
          uploadStatus: "PENDING",
          mistakeId: null,
        },
        data: {
          uploadStatus: "UPLOADED",
        },
      });

      return prisma.mistakeAttachment.findMany({
        where: {
          id: { in: attachmentIds },
          userId: ctx.user.id,
        },
        orderBy: { createdAt: "asc" },
      });
    }),
});
