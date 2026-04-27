import {
  TEST_ATTEMPT_DEFAULT_PAGE_SIZE,
  TEST_ATTEMPT_MAX_PAGE_SIZE,
  TEST_ATTEMPT_STATUS_VALUES,
  TEST_ATTEMPT_TYPE_VALUES,
  TEST_ATTEMPT_VIEW_SELECT,
} from "@/configs/const/test-attempt";
import { prisma } from "@/lib/prisma";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { authedProcedure, createTRPCRouter } from "../init";

const testAttemptCreateInputSchema = z.object({
  title: z.string().trim().min(1).max(255),
  examName: z.string().trim().max(255).nullable().optional(),
  sourceName: z.string().trim().max(255).nullable().optional(),
  sourceYear: z.number().int().min(0).max(9999).nullable().optional(),
  type: z.enum(TEST_ATTEMPT_TYPE_VALUES).optional(),
  status: z.enum(TEST_ATTEMPT_STATUS_VALUES).optional(),
  attemptedAt: z.coerce.date().optional(),
  durationSeconds: z.number().int().min(0).nullable().optional(),
  totalQuestions: z.number().int().min(0).nullable().optional(),
  correctCount: z.number().int().min(0).nullable().optional(),
  incorrectCount: z.number().int().min(0).nullable().optional(),
  skippedCount: z.number().int().min(0).nullable().optional(),
  score: z.number().finite().nullable().optional(),
  maxScore: z.number().finite().nullable().optional(),
  notes: z.string().trim().max(5000).nullable().optional(),
});

const testAttemptUpdateInputSchema = testAttemptCreateInputSchema
  .partial()
  .extend({
    id: z.string().min(1),
  })
  .refine((value) => Object.keys(value).some((key) => key !== "id"), {
    message: "At least one field is required for update",
  });

const testAttemptViewInputSchema = z.object({
  limit: z
    .number()
    .int()
    .min(1)
    .max(TEST_ATTEMPT_MAX_PAGE_SIZE)
    .default(TEST_ATTEMPT_DEFAULT_PAGE_SIZE),
  cursor: z.string().min(1).optional(),
  type: z.enum(TEST_ATTEMPT_TYPE_VALUES).optional(),
  status: z.enum(TEST_ATTEMPT_STATUS_VALUES).optional(),
  search: z.string().trim().max(255).optional(),
});

export const testAttemptRouter = createTRPCRouter({
  create: authedProcedure
    .input(testAttemptCreateInputSchema)
    .mutation(async ({ ctx, input }) => {
      return prisma.testAttempt.create({
        data: {
          ...input,
          userId: ctx.user.id,
        },
        select: {
          ...TEST_ATTEMPT_VIEW_SELECT,
          _count: {
            select: { questions: true },
          },
        },
      });
    }),

  byId: authedProcedure
    .input(
      z.object({
        id: z.string().min(1),
      }),
    )
    .query(async ({ ctx, input }) => {
      const attempt = await prisma.testAttempt.findFirst({
        where: {
          id: input.id,
          userId: ctx.user.id,
        },
        include: {
          questions: {
            orderBy: [{ questionNumber: "asc" }, { createdAt: "asc" }],
          },
        },
      });

      if (!attempt) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Test attempt not found",
        });
      }

      return attempt;
    }),

  view: authedProcedure
    .input(testAttemptViewInputSchema)
    .query(async ({ ctx, input }) => {
      const limit = input.limit;
      const search = input.search?.trim();

      const attempts = await prisma.testAttempt.findMany({
        where: {
          userId: ctx.user.id,
          type: input.type,
          status: input.status,
          ...(search
            ? {
                OR: [
                  { title: { contains: search, mode: "insensitive" } },
                  { examName: { contains: search, mode: "insensitive" } },
                  { sourceName: { contains: search, mode: "insensitive" } },
                ],
              }
            : {}),
        },
        orderBy: [{ attemptedAt: "desc" }, { id: "desc" }],
        cursor: input.cursor ? { id: input.cursor } : undefined,
        skip: input.cursor ? 1 : 0,
        take: limit + 1,
        select: {
          ...TEST_ATTEMPT_VIEW_SELECT,
          _count: {
            select: { questions: true },
          },
        },
      });

      let nextCursor: string | undefined;
      if (attempts.length > limit) {
        const nextItem = attempts.pop();
        nextCursor = nextItem?.id;
      }

      return {
        items: attempts,
        nextCursor,
      };
    }),

  update: authedProcedure
    .input(testAttemptUpdateInputSchema)
    .mutation(async ({ ctx, input }) => {
      const existing = await prisma.testAttempt.findFirst({
        where: {
          id: input.id,
          userId: ctx.user.id,
        },
        select: { id: true },
      });

      if (!existing) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Test attempt not found",
        });
      }

      const { id, ...data } = input;

      return prisma.testAttempt.update({
        where: { id },
        data,
        select: {
          ...TEST_ATTEMPT_VIEW_SELECT,
          _count: {
            select: { questions: true },
          },
        },
      });
    }),

  delete: authedProcedure
    .input(
      z.object({
        id: z.string().min(1),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const existing = await prisma.testAttempt.findFirst({
        where: {
          id: input.id,
          userId: ctx.user.id,
        },
        select: { id: true },
      });

      if (!existing) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Test attempt not found",
        });
      }

      await prisma.testAttempt.delete({
        where: { id: input.id },
      });

      return { success: true };
    }),
});
