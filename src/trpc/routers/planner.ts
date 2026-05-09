import { TRPCError } from "@trpc/server";
import { startOfDay } from "date-fns";
import { Subject, TaskStatus } from "@/generated/prisma/enums";
import { prisma } from "@/lib/prisma";
import { authedProcedure, createTRPCRouter } from "../init";
import { buildPlanTasks } from "@/utils/planner-utils/tasks";
import { buildTopicsForPlanning } from "@/utils/planner-utils/topics";
import { generateStudyPlan } from "@/utils/planner-utils/generate-plan";
import { z } from "zod";

export const plannerRouter = createTRPCRouter({
  today: authedProcedure.query(async ({ ctx }) => {
    const today = startOfDay(new Date());
    const planner = await prisma.studyPlan.findFirst({
      where: {
        date: today,
        userId: ctx.user.id,
      },
      include: {
        tasks: {
          orderBy: { order: "asc" },
        },
      },
    });
    if (!planner) {
      return { tasks: [], totalMinutes: 0 };
    }
    return { tasks: planner.tasks, totalMinutes: planner.totalMinutes };
  }),
  generateToday: authedProcedure.query(async ({ ctx }) => {
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
    const weakestSubject = onboarding.weakestSubject ?? Subject.maths;
    const chaptersWithTopics = await prisma.studyChapter.findMany({
      where: {
        subject: { in: [Subject.physics, Subject.chemistry, Subject.maths] },
      },
      select: {
        id: true,
        subject: true,
        name: true,
        order: true,
        topics: {
          select: {
            id: true,
            name: true,
            difficulty: true,
            importance: true,
            estimatedMinutes: true,
            order: true,
            userProgress: {
              where: { userId },
              select: {
                status: true,
                confidence: true,
                mistakesCount: true,
                lastStudiedAt: true,
                lastRevisedAt: true,
              },
              take: 1,
            },
          },
          orderBy: { order: "asc" },
        },
      },
      orderBy: { order: "asc" },
    });

    const topicsForPlanning = buildTopicsForPlanning(chaptersWithTopics);

    if (topicsForPlanning.length === 0) {
      throw new TRPCError({
        code: "PRECONDITION_FAILED",
        message: "No study topics are available to generate a plan",
      });
    }

    if (!process.env.GOOGLE_AI_API_KEY) {
      throw new TRPCError({
        code: "PRECONDITION_FAILED",
        message: "GOOGLE_AI_API_KEY is required to generate a study plan",
      });
    }

    const generatedPlan = await generateStudyPlan({
      dailyMinutes,
      weakestSubject,
      onboarding: {
        examYear: onboarding.examYear,
        attemptNumber: onboarding.attemptNumber,
        coachingStart: onboarding.coachingStart,
        coachingEnd: onboarding.coachingEnd,
        rankAim: onboarding.rankAim,
      },
      topics: topicsForPlanning,
    });

    const { tasks, totalMinutes } = buildPlanTasks({
      generatedPlan,
      topicsForPlanning,
      dailyMinutes,
    });

    return prisma.studyPlan.create({
      data: {
        userId,
        date: today,
        totalMinutes,
        tasks: {
          create: tasks,
        },
      },
      include: {
        tasks: {
          orderBy: { order: "asc" },
        },
      },
    });
  }),
  updateTaskStatus: authedProcedure
    .input(
      z.object({
        taskId: z.string().min(1),
        status: z.nativeEnum(TaskStatus),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const updated = await prisma.studyPlanTask.updateMany({
        where: {
          id: input.taskId,
          plan: { userId: ctx.user.id },
        },
        data: {
          status: input.status,
        },
      });

      if (updated.count === 0) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Task not found",
        });
      }

      return { id: input.taskId, status: input.status };
    }),
});
