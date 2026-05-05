import { Subject } from "@/generated/prisma/enums";
import { z } from "zod";
import { authedProcedure, createTRPCRouter } from "../init";
import { prisma } from "@/lib/prisma";

export const onboardingRouter = createTRPCRouter({
  complete: authedProcedure
    .input(
      z.object({
        examYear: z.number().int().min(2024),
        attemptNumber: z.number().int().optional().nullable(),
        dailyStudyMinutes: z.number().int().optional().nullable(),
        coachingStart: z.number().int().optional().nullable(),
        rankAim: z.number().int().optional().nullable(),
        coachingEnd: z.number().int().optional().nullable(),
        weakestSubject: z.enum(Subject).optional().nullable(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { user } = ctx;

      const onboarding = await prisma.onboarding.upsert({
        where: { userId: user.id },
        update: {
          examYear: input.examYear,
          attemptNumber: input.attemptNumber,
          dailyStudyMinutes: input.dailyStudyMinutes,
          coachingStart: input.coachingStart,
          rankAim: input.rankAim,
          coachingEnd: input.coachingEnd,
          weakestSubject: input.weakestSubject,
        },
        create: {
          userId: user.id,
          examYear: input.examYear,
          attemptNumber: input.attemptNumber,
          dailyStudyMinutes: input.dailyStudyMinutes,
          coachingStart: input.coachingStart,
          rankAim: input.rankAim,
          coachingEnd: input.coachingEnd,
          weakestSubject: input.weakestSubject,
        },
      });

      await prisma.user.update({
        where: { id: user.id },
        data: { onboardingDone: true },
      });

      return { success: true, onboarding };
    }),
  isCompleted: authedProcedure.query(async ({ ctx }) => {
    const { user } = ctx;
    const onboarding = await prisma.user.findUnique({
      where: { id: user.id },
      select: {
        onboardingDone: true,
      },
    });
    return {
      success: true,
      data: onboarding?.onboardingDone,
    };
  }),
});
