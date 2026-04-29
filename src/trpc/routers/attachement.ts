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
import {
  MAX_UPLOADS_PER_REQUEST,
  MAX_UPLOAD_SIZE_BYTES,
} from "@/configs/const/mistake";
import { inngest } from "@/lib/inngest";

const uploadFileInputSchema = z.object({
  fileName: z.string().trim().min(1).max(255),
  mimeType: z.string().trim().min(1).max(255),
  sizeBytes: z.number().int().min(1).max(MAX_UPLOAD_SIZE_BYTES).optional(),
});

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

      // Create an UploadBatch to group these attachments
      const batch = await prisma.uploadBatch.create({
        data: {
          userId: ctx.user.id,
        },
      });

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
            batchId: batch.id,
          };
        }),
      );

      await prisma.attachment.createMany({
        skipDuplicates: true,
        data: uploads.map((upload) => ({
          id: upload.attachmentId,
          batchId: upload.batchId,
          userId: ctx.user.id,
          storageKey: upload.storageKey,
          publicUrl: upload.publicUrl,
          mimeType: upload.file.mimeType,
          sizeBytes: upload.file.sizeBytes,
          status: "PENDING" as const,
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
        attachmentIds: z
          .array(z.string().min(1))
          .min(1)
          .max(MAX_UPLOADS_PER_REQUEST),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const attachmentIds = Array.from(new Set(input.attachmentIds));
      const attachments = await prisma.attachment.findMany({
        where: {
          id: { in: attachmentIds },
          userId: ctx.user.id,
        },
        select: {
          id: true,
          status: true,
        },
      });

      if (attachments.length !== attachmentIds.length) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "One or more attachments were not found.",
        });
      }

      const invalidAttachment = attachments.find(
        (attachment) => attachment.status !== "PENDING",
      );

      if (invalidAttachment) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Only pending uploads can be marked as uploaded.",
        });
      }

      await prisma.attachment.updateMany({
        where: {
          id: { in: attachmentIds },
          userId: ctx.user.id,
          status: "PENDING",
        },
        data: {
          status: "UPLOADED",
        },
      });

      await inngest.send({
        name: "attachment/processing.requested",
        data: {
          attachmentIds,
          userId: ctx.user.id,
        },
      });

      return prisma.attachment.findMany({
        where: {
          id: { in: attachmentIds },
          userId: ctx.user.id,
        },
        orderBy: { createdAt: "asc" },
      });
    }),
});
