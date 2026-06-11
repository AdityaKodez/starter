import { Subject } from "@/generated/prisma/enums";
import { z } from "zod";
import { authedProcedure, createTRPCRouter } from "../init";
import { prisma } from "@/lib/prisma";

export const onboardingRouter = createTRPCRouter({
  complete: authedProcedure
    .input(
      z.object({
        examYear: z.number().int().min(2024),
        attemptNumber: z.number().int(),
        dailyStudyMinutes: z.number().int(),
        coachingStart: z.number().int(),
        rankAim: z.number().int(),
        coachingEnd: z.number().int(),
        schoolStart: z.number().int().min(0).max(23),
        schoolEnd: z.number().int().min(0).max(23),
        weakestSubject: z.enum(Subject),
        timeZone: z.string().trim().min(1).max(80).optional(),
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
          schoolStart: input.schoolStart,
          schoolEnd: input.schoolEnd,
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
          schoolStart: input.schoolStart,
          schoolEnd: input.schoolEnd,
          weakestSubject: input.weakestSubject,
        },
      });

      await prisma.user.update({
        where: { id: user.id },
        data: {
          onboardingDone: true,
          timeZone: input.timeZone ?? undefined,
        },
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
