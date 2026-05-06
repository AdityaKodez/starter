import { authedProcedure } from "../init";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { createTRPCRouter } from "../init";
import { TRPCError } from "@trpc/server";
import { startOfDay } from "date-fns";

export const plannerRouter = createTRPCRouter({
  today: authedProcedure.query(async ({ ctx }) => {
    const planner = await prisma.studyPlan.findFirst({
      where: {
        date: new Date(),
        userId: ctx.user.id,
      },
    });
    if (!planner) {
      return { tasks: [], totalMinutes: 0 };
    }
    const tasks = await prisma.studyPlanTask.findMany({
      where: {
        planId: planner.id,
      },
      orderBy: {
        order: "asc",
      },
    });
    return { tasks, totalMinutes: planner.totalMinutes };
  }),
  generateToday: authedProcedure.mutation(async ({ ctx }) => {
    const userId = ctx.user.id;
    const today = startOfDay(new Date());

    const onboarding = await prisma.onboarding.findUnique({
      where: { userId },
    });
    if (!onboarding) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Complete onboarding first",
      });
    }
    const existingPlan = await prisma.studyPlan.findUnique({
      where: {
        userId_date: {
          userId,
          date: today,
        },
      },
      include: {
        tasks: {
          orderBy: { order: "asc" },
        },
      },
    });

    if (existingPlan) return existingPlan;

    const dailyMinutes = onboarding.dailyStudyMinutes ?? 180;
    const weakestSubject = onboarding.weakestSubject ?? "maths";
  }),
});
