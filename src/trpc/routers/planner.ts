import { TRPCError } from "@trpc/server";
import { eachDayOfInterval, format, startOfDay, subDays } from "date-fns";
import {
  ReflectionMood,
  ReflectionTaskFeel,
  StudyPlanTaskType,
  Subject,
  TaskStatus,
} from "@/generated/prisma/enums";
import { prisma } from "@/lib/prisma";
import { authedProcedure, createTRPCRouter } from "../init";
import { buildPlanTasks } from "@/utils/planner-utils/tasks";
import {
  buildRankedTopicCandidates,
  buildTopicsForPlanning,
} from "@/utils/planner-utils/topics";
import { generateStudyPlan } from "@/utils/planner-utils/generate-plan";
import { z } from "zod";

const roundToOneDecimal = (value: number) => Math.round(value * 10) / 10;

const clampPercent = (value: number) => Math.min(100, Math.max(0, value));

const parseTestResultToPercent = (result: string | null) => {
  if (!result) return null;
  const trimmed = result.trim();
  if (!trimmed) return null;

  const percentMatch = trimmed.match(/(\d+(?:\.\d+)?)\s*%/);
  if (percentMatch) {
    const value = Number(percentMatch[1]);
    return Number.isFinite(value) ? clampPercent(value) : null;
  }

  const fractionMatch = trimmed.match(/(\d+(?:\.\d+)?)\s*\/\s*(\d+(?:\.\d+)?)/);
  if (fractionMatch) {
    const numerator = Number(fractionMatch[1]);
    const denominator = Number(fractionMatch[2]);
    if (!Number.isFinite(numerator) || !Number.isFinite(denominator) || denominator <= 0) {
      return null;
    }
    return clampPercent((numerator / denominator) * 100);
  }

  return null;
};

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
        reflection: true,
      },
    });
    if (!planner) {
      return { tasks: [], totalMinutes: 0 };
    }
    return { tasks: planner.tasks, totalMinutes: planner.totalMinutes };
  }),
  dailyStudyStats: authedProcedure.query(async ({ ctx }) => {
    const today = startOfDay(new Date());
    const startDate = subDays(today, 6);
    const plans = await prisma.studyPlan.findMany({
      where: {
        userId: ctx.user.id,
        date: {
          gte: startDate,
          lte: today,
        },
      },
      include: {
        tasks: {
          where: { status: TaskStatus.done },
          select: {
            subject: true,
            durationMinutes: true,
          },
        },
      },
      orderBy: { date: "asc" },
    });

    const planByDate = new Map<string, (typeof plans)[number]>();
    for (const plan of plans) {
      planByDate.set(format(plan.date, "yyyy-MM-dd"), plan);
    }

    return eachDayOfInterval({ start: startDate, end: today }).map((day) => {
      const key = format(day, "yyyy-MM-dd");
      const plan = planByDate.get(key);
      const totals = { physics: 0, chemistry: 0, maths: 0 };

      if (plan) {
        for (const task of plan.tasks) {
          totals[task.subject] += task.durationMinutes;
        }
      }

      return {
        date: format(day, "MMM d"),
        physics: totals.physics,
        chemistry: totals.chemistry,
        maths: totals.maths,
        totalMinutes: totals.physics + totals.chemistry + totals.maths,
      };
    });
  }),
  testResultStats: authedProcedure.query(async ({ ctx }) => {
    const [planResults, manualResults] = await Promise.all([
      prisma.studyPlanTask.findMany({
        where: {
          type: StudyPlanTaskType.test,
          plan: { userId: ctx.user.id },
          testResult: { not: null },
        },
        select: {
          testResult: true,
        },
      }),
      prisma.userTestResult.findMany({
        where: { userId: ctx.user.id },
        select: { result: true },
      }),
    ]);

    const parsedResults = [
      ...planResults.map((task) => parseTestResultToPercent(task.testResult)),
      ...manualResults.map((result) => parseTestResultToPercent(result.result)),
    ].filter((value): value is number => value !== null);

    const totalResults = planResults.length + manualResults.length;

    if (parsedResults.length === 0) {
      return {
        totalResults,
        parsedResults: 0,
        averagePercent: null,
        bestPercent: null,
      };
    }

    const sum = parsedResults.reduce((acc, value) => acc + value, 0);
    const averagePercent = roundToOneDecimal(sum / parsedResults.length);
    const bestPercent = roundToOneDecimal(Math.max(...parsedResults));

    return {
      totalResults,
      parsedResults: parsedResults.length,
      averagePercent,
      bestPercent,
    };
  }),
  addManualTestResult: authedProcedure
    .input(
      z.object({
        subject: z.enum(Subject),
        title: z.string().trim().max(120).nullable().optional(),
        result: z.string().trim().min(1).max(200),
        takenAt: z.coerce.date().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const created = await prisma.userTestResult.create({
        data: {
          userId: ctx.user.id,
          subject: input.subject,
          title: input.title?.trim() || null,
          result: input.result.trim(),
          takenAt: input.takenAt ?? new Date(),
        },
      });

      return {
        id: created.id,
        subject: created.subject,
        title: created.title,
        result: created.result,
        takenAt: created.takenAt,
      };
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
        reflection: true,
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

    const topicCandidates = buildRankedTopicCandidates({
      topics: topicsForPlanning,
      weakestSubject,
      now: today,
    });

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
      topics: topicCandidates,
    });

    const { tasks, totalMinutes } = buildPlanTasks({
      generatedPlan,
      topicsForPlanning: topicCandidates,
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
        reflection: true,
      },
    });
  }),
  updateTaskStatus: authedProcedure
    .input(
      z
        .object({
          taskId: z.string().min(1),
          status: z.enum(TaskStatus),
          skipReason: z.string().trim().min(1).max(120).nullable().optional(),
        })
        .refine(
          (value) =>
            value.status !== TaskStatus.skipped || Boolean(value.skipReason),
          {
            message: "skipReason is required when skipping a task",
            path: ["skipReason"],
          },
        ),
    )
    .mutation(async ({ ctx, input }) => {
      const skipReason =
        input.status === TaskStatus.skipped
          ? input.skipReason?.trim() ?? null
          : null;
      const updated = await prisma.studyPlanTask.updateMany({
        where: {
          id: input.taskId,
          plan: { userId: ctx.user.id },
        },
        data: {
          status: input.status,
          skipReason,
        },
      });

      if (updated.count === 0) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Task not found",
        });
      }

      return { id: input.taskId, status: input.status, skipReason };
    }),
  updateTestResult: authedProcedure
    .input(
      z.object({
        taskId: z.string().min(1),
        testResult: z.string().trim().max(200).nullable(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const nextResult = input.testResult?.trim() ?? null;
      const updated = await prisma.studyPlanTask.updateMany({
        where: {
          id: input.taskId,
          type: StudyPlanTaskType.test,
          plan: { userId: ctx.user.id },
        },
        data: {
          testResult: nextResult,
        },
      });

      if (updated.count === 0) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Test task not found",
        });
      }

      return { id: input.taskId, testResult: nextResult };
    }),
  savePlanReflection: authedProcedure
    .input(
      z.object({
        planId: z.string().min(1),
        taskFeeling: z.enum(ReflectionTaskFeel),
        mood: z.enum(ReflectionMood),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const plan = await prisma.studyPlan.findFirst({
        where: {
          id: input.planId,
          userId: ctx.user.id,
        },
      });

      if (!plan) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Study plan not found",
        });
      }

      return prisma.studyPlanReflection.upsert({
        where: { planId: input.planId },
        update: {
          taskFeeling: input.taskFeeling,
          mood: input.mood,
        },
        create: {
          planId: input.planId,
          taskFeeling: input.taskFeeling,
          mood: input.mood,
        },
      });
    }),
});
