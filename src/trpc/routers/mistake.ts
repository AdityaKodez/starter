import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { prisma } from "@/lib/prisma";
import { Prisma } from "@/generated/prisma/client";

import { authedProcedure, createTRPCRouter } from "../init";

const mistakeTypeSchema = z.enum([
  "CONCEPTUAL",
  "SILLY",
  "CALCULATION",
  "MISREAD",
  "UNKNOWN",
]);

const mistakeStatusSchema = z.enum(["NEW", "REVIEWING", "MASTERED", "ARCHIVED"]);

const mistakeUpsertInputSchema = z.object({
  questionAttemptId: z.string().min(1),
  attachmentIds: z.array(z.string().min(1)).max(10).optional().default([]),
  title: z.string().trim().max(255).nullable().optional(),
  type: mistakeTypeSchema.optional(),
  status: mistakeStatusSchema.optional(),
  contextFlags: z.record(z.string(), z.unknown()).optional(),
  userNote: z.string().trim().max(5000).nullable().optional(),
  rootCause: z.string().trim().max(5000).nullable().optional(),
  fixPlan: z.string().trim().max(5000).nullable().optional(),
  retryDueAt: z.coerce.date().nullable().optional(),
});

export const mistakeRouter = createTRPCRouter({
  upsertForQuestion: authedProcedure
    .input(mistakeUpsertInputSchema)
    .mutation(async ({ ctx, input }) => {
      const attachmentIds = Array.from(new Set(input.attachmentIds));

      return prisma.$transaction(async (tx) => {
        const questionAttempt = await tx.questionAttempt.findFirst({
          where: {
            id: input.questionAttemptId,
            userId: ctx.user.id,
          },
          select: { id: true },
        });

        if (!questionAttempt) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Question attempt not found.",
          });
        }

        const mistakeData = {
          title: input.title,
          type: input.type,
          status: input.status,
          contextFlags: input.contextFlags as Prisma.InputJsonValue | undefined,
          userNote: input.userNote,
          rootCause: input.rootCause,
          fixPlan: input.fixPlan,
          retryDueAt: input.retryDueAt,
        };

        const mistake = await tx.mistake.upsert({
          where: {
            questionAttemptId: input.questionAttemptId,
          },
          create: {
            ...mistakeData,
            questionAttemptId: input.questionAttemptId,
            userId: ctx.user.id,
          },
          update: mistakeData,
          select: { id: true },
        });

        if (attachmentIds.length > 0) {
          const attachments = await tx.mistakeAttachment.findMany({
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
              attachment.uploadStatus !== "UPLOADED" ||
              attachment.mistakeId !== null,
          );

          if (invalidAttachment) {
            throw new TRPCError({
              code: "BAD_REQUEST",
              message: "Only uploaded, unattached files can be added to a mistake.",
            });
          }

          const attachResult = await tx.mistakeAttachment.updateMany({
            where: {
              id: { in: attachmentIds },
              userId: ctx.user.id,
              uploadStatus: "UPLOADED",
              mistakeId: null,
            },
            data: {
              mistakeId: mistake.id,
              uploadStatus: "ATTACHED",
            },
          });

          if (attachResult.count !== attachmentIds.length) {
            throw new TRPCError({
              code: "CONFLICT",
              message: "One or more attachments could not be attached.",
            });
          }
        }

        return tx.mistake.findUniqueOrThrow({
          where: { id: mistake.id },
          include: {
            attachments: {
              orderBy: { createdAt: "asc" },
            },
          },
        });
      });
    }),
});
