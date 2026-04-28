import { z } from "zod";

import { prisma } from "@/lib/prisma";
import {
  MISTAKE_DEFAULT_PAGE_SIZE,
  MISTAKE_MAX_PAGE_SIZE,
  MISTAKE_VIEW_SELECT,
} from "@/configs/const/mistake";

import { authedProcedure, createTRPCRouter } from "../init";

const mistakeTypeSchema = z.enum([
  "CONCEPTUAL",
  "SILLY",
  "CALCULATION",
  "MISREAD",
  "UNKNOWN",
]);

const mistakeStatusSchema = z.enum(["NEW", "REVIEWING", "MASTERED", "ARCHIVED"]);

const mistakeViewInputSchema = z.object({
  limit: z
    .number()
    .int()
    .min(1)
    .max(MISTAKE_MAX_PAGE_SIZE)
    .default(MISTAKE_DEFAULT_PAGE_SIZE),
  cursor: z.string().min(1).optional(),
  type: mistakeTypeSchema.optional(),
  status: mistakeStatusSchema.optional(),
  search: z.string().trim().max(255).optional(),
});

export const mistakeRouter = createTRPCRouter({
  view: authedProcedure
    .input(mistakeViewInputSchema)
    .query(async ({ ctx, input }) => {
      const limit = input.limit;
      const search = input.search?.trim();

      const mistakes = await prisma.mistake.findMany({
        where: {
          // Ownership derived through AnalysisRun -> Attachment -> User
          analysisRun: {
            attachment: {
              userId: ctx.user.id,
            },
          },
          type: input.type,
          status: input.status,
          ...(search
            ? {
                OR: [
                  { description: { contains: search, mode: "insensitive" } },
                  { topic: { contains: search, mode: "insensitive" } },
                ],
              }
            : {}),
        },
        orderBy: [{ createdAt: "desc" }, { id: "desc" }],
        cursor: input.cursor ? { id: input.cursor } : undefined,
        skip: input.cursor ? 1 : 0,
        take: limit + 1,
        select: MISTAKE_VIEW_SELECT,
      });

      let nextCursor: string | undefined;
      if (mistakes.length > limit) {
        const nextItem = mistakes.pop();
        nextCursor = nextItem?.id;
      }

      return {
        items: mistakes,
        nextCursor,
      };
    }),
});
