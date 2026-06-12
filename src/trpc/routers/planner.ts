import {
  ReflectionMood,
  ReflectionTaskFeel,
  RewardType,
  StudyPlanTaskType,
  Subject,
  TaskStatus,
  UserTestDeadlineStatus,
} from "@/generated/prisma/enums";
import { prisma } from "@/lib/prisma";
import {
  calculateDisplayStreak,
  calculateNextStreakOnActivity,
  getStreakEmoji,
  resolveTimeZone,
} from "@/lib/streak";
import { generateStudyPlan } from "@/utils/planner-utils/generate-plan";
import { buildPlanTasks } from "@/utils/planner-utils/tasks";
import {
  buildRankedTopicCandidates,
  buildTopicsForPlanning,
} from "@/utils/planner-utils/topics";
import { TRPCError } from "@trpc/server";
import {
  addDays,
  differenceInCalendarDays,
  eachDayOfInterval,
  format,
  startOfDay,
  subDays,
} from "date-fns";
import { z } from "zod";
import { authedProcedure, createTRPCRouter } from "../init";

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

const TEST_DEADLINE_PLANNING_WINDOW_DAYS = 14;
const STUDY_STATS_WINDOW_DAYS = 364;

const buildUpcomingTestDeadlinesForPlanning = async (userId: string, today: Date) => {
  const deadlines = await prisma.userTestDeadline.findMany({
    where: {
      userId,
      status: UserTestDeadlineStatus.active,
      scheduledAt: {
        gte: today,
        lte: addDays(today, TEST_DEADLINE_PLANNING_WINDOW_DAYS),
      },
    },
    orderBy: { scheduledAt: "asc" },
    take: 5,
  });

  return deadlines.map((deadline) => ({
    id: deadline.id,
    subject: deadline.subject,
    title: deadline.title,
    scheduledAt: deadline.scheduledAt.toISOString(),
    daysUntil: differenceInCalendarDays(startOfDay(deadline.scheduledAt), today),
    notes: deadline.notes,
  }));
};

export const plannerRouter = createTRPCRouter({
 
  dailyStudyStats: authedProcedure.query(async ({ ctx }) => {
    const today = startOfDay(new Date());
    const startDate = subDays(today, STUDY_STATS_WINDOW_DAYS - 1);
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
        dateKey: key,
        date: format(day, "MMM d"),
        physics: totals.physics,
        chemistry: totals.chemistry,
        maths: totals.maths,
        totalMinutes: totals.physics + totals.chemistry + totals.maths,
      };
    });
  }),
  streakSummary: authedProcedure.query(async ({ ctx }) => {
    const user = await prisma.user.findUnique({
      where: { id: ctx.user.id },
      select: {
        timeZone: true,
        streak: {
          select: {
            count: true,
            lastDate: true,
          },
        },
      },
    });

    const timeZone = resolveTimeZone(user?.timeZone ?? null);
    const currentDate = new Date();
    const currentStreak = calculateDisplayStreak({
      lastActiveDate: user?.streak?.lastDate ?? null,
      currentStreak: user?.streak?.count ?? 0,
      currentDate,
      timeZone,
    });

    return {
      count: currentStreak,
      emoji: getStreakEmoji(currentStreak),
      lastDate: user?.streak?.lastDate ?? null,
      timeZone,
    };
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
  upcomingTestDeadlines: authedProcedure.query(async ({ ctx }) => {
    const today = startOfDay(new Date());

    return prisma.userTestDeadline.findMany({
      where: {
        userId: ctx.user.id,
        status: UserTestDeadlineStatus.active,
        scheduledAt: { gte: today },
      },
      orderBy: { scheduledAt: "asc" },
      take: 6,
    });
  }),
  addTestDeadline: authedProcedure
    .input(
      z.object({
        subject: z.enum(Subject),
        title: z.string().trim().min(1).max(120),
        scheduledAt: z.coerce.date(),
        notes: z.string().trim().max(200).nullable().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const scheduledAt = startOfDay(input.scheduledAt);
      const today = startOfDay(new Date());

      if (scheduledAt < today) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Test date cannot be in the past",
        });
      }

      const created = await prisma.userTestDeadline.create({
        data: {
          userId: ctx.user.id,
          subject: input.subject,
          title: input.title.trim(),
          scheduledAt,
          notes: input.notes?.trim() || null,
        },
      });

      return created;
    }),
  markTestDeadlineDone: authedProcedure
    .input(z.object({ deadlineId: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      const updated = await prisma.userTestDeadline.updateMany({
        where: {
          id: input.deadlineId,
          userId: ctx.user.id,
          status: UserTestDeadlineStatus.active,
        },
        data: { status: UserTestDeadlineStatus.completed },
      });

      if (updated.count === 0) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Test deadline not found",
        });
      }

      return { id: input.deadlineId, status: UserTestDeadlineStatus.completed };
    }),
  generateToday: authedProcedure.query(async ({ ctx }) => {
    const userId = ctx.user.id;
    const today = startOfDay(new Date());

    const onboarding = await prisma.onboarding.findUnique({
      where: { userId },
      include: {
        user: {
          select: { timeZone: true },
        },
      },
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
   
    const dailyMinutes = onboarding.dailyStudyMinutes ;
    const weakestSubject = onboarding.weakestSubject;
    const chaptersWithTopics = await prisma.studyChapter.findMany({
   
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
    const testDeadlines = await buildUpcomingTestDeadlinesForPlanning(userId, today);
    const topicCandidates = buildRankedTopicCandidates({
      topics: topicsForPlanning,
      weakestSubject,
      testDeadlines,
      now: today,
    });

    const userTimeZone = resolveTimeZone(onboarding.user?.timeZone ?? null);
    const dayOfWeekFormatter = new Intl.DateTimeFormat("en-US", {
      timeZone: userTimeZone,
      weekday: "long",
    });
    const currentDayOfWeek = dayOfWeekFormatter.format(new Date());

    const lastReflectionRecord = await prisma.studyPlanReflection.findFirst({
      where: { plan: { userId, date: { lt: today } } },
      orderBy: { createdAt: "desc" },
      select: { mood: true, taskFeeling: true },
    });

    const generatedPlan = await generateStudyPlan({
      dailyMinutes,
      weakestSubject,
      onboarding: {
        examYear: onboarding.examYear,
        attemptNumber: onboarding.attemptNumber,
        coachingStart: onboarding.coachingStart,
        coachingEnd: onboarding.coachingEnd,
        schoolStart: onboarding.schoolStart,
        schoolEnd: onboarding.schoolEnd,
        rankAim: onboarding.rankAim,
      },
      topics: topicCandidates,
      testDeadlines,
      currentDayOfWeek,
      lastReflection: lastReflectionRecord,
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
  regeneratePlan: authedProcedure
    .input(
      z.object({
        date: z.coerce.date().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.user.id;
      const date = startOfDay(input.date ?? new Date());

      const onboarding = await prisma.onboarding.findUnique({
        where: { userId },
        include: {
          user: {
            select: { timeZone: true },
          },
        },
      });
      if (!onboarding) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Complete onboarding first",
        });
      }

      const dailyMinutes = onboarding.dailyStudyMinutes;
      const weakestSubject = onboarding.weakestSubject;

      // Delete existing plan for the date
      await prisma.studyPlan.deleteMany({
        where: {
          userId,
          date,
        },
      });

      // Also delete related tasks and reflections (cascade should handle this, but explicit is safer)
      await prisma.studyPlanTask.deleteMany({
        where: {
          plan: {
            userId,
            date,
          },
        },
      });

      await prisma.studyPlanReflection.deleteMany({
        where: {
          plan: {
            userId,
            date,
          },
        },
      });

      const chaptersWithTopics = await prisma.studyChapter.findMany({
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

      const testDeadlines = await buildUpcomingTestDeadlinesForPlanning(userId, date);
      const topicCandidates = buildRankedTopicCandidates({
        topics: topicsForPlanning,
        weakestSubject,
        testDeadlines,
        now: date,
      });

      const userTimeZone = resolveTimeZone(onboarding.user?.timeZone ?? null);
      const dayOfWeekFormatter = new Intl.DateTimeFormat("en-US", {
        timeZone: userTimeZone,
        weekday: "long",
      });
      const currentDayOfWeek = dayOfWeekFormatter.format(date);

      const lastReflectionRecord = await prisma.studyPlanReflection.findFirst({
        where: { plan: { userId, date: { lt: date } } },
        orderBy: { createdAt: "desc" },
        select: { mood: true, taskFeeling: true },
      });

      const generatedPlan = await generateStudyPlan({
        dailyMinutes,
        weakestSubject,
        onboarding: {
          examYear: onboarding.examYear,
          attemptNumber: onboarding.attemptNumber,
          coachingStart: onboarding.coachingStart,
          coachingEnd: onboarding.coachingEnd,
          schoolStart: onboarding.schoolStart,
          schoolEnd: onboarding.schoolEnd,
          rankAim: onboarding.rankAim,
        },
        topics: topicCandidates,
        testDeadlines,
        currentDayOfWeek,
        lastReflection: lastReflectionRecord,
      });

      const { tasks, totalMinutes } = buildPlanTasks({
        generatedPlan,
        topicsForPlanning: topicCandidates,
        dailyMinutes,
      });

      return prisma.studyPlan.create({
        data: {
          userId,
          date,
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
          timeZone: z.string().trim().min(1).max(80).optional(),
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
      const user = await prisma.user.findUnique({
        where: { id: ctx.user.id },
        select: {
          id: true,
          timeZone: true,
          streak: {
            select: {
              count: true,
              lastDate: true,
            },
          },
        },
      });

      if (!user) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "User not found",
        });
      }

      const resolvedInputTimeZone = input.timeZone
        ? resolveTimeZone(input.timeZone)
        : null;
      const timeZone = resolveTimeZone(
        resolvedInputTimeZone ?? user.timeZone ?? null,
      );
      const now = new Date();
      const skipReason =
        input.status === TaskStatus.skipped
          ? input.skipReason?.trim() ?? null
          : null;

      return prisma.$transaction(async (tx) => {
        const task = await tx.studyPlanTask.findFirst({
          where: {
            id: input.taskId,
            plan: { userId: user.id },
          },
          select: { id: true, status: true, rewardType: true, rewardAmount: true },
        });

        if (!task) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Task not found",
          });
        }

        const wasDone = task.status === TaskStatus.done;
        const isNowDone = input.status === TaskStatus.done;
        const completedAt = isNowDone ? now : null;

        // Roll a reward exactly once per task — re-completions reuse the
        // stored reward, un-completing never claws it back.
        let reward: { type: RewardType; amount: number } | null = null;
        if (!wasDone && isNowDone) {
          if (task.rewardType && task.rewardAmount) {
            reward = { type: task.rewardType, amount: task.rewardAmount };
          } else {
            reward =
              Math.random() < 0.6
                ? { type: RewardType.xp, amount: 25 }
                : { type: RewardType.gems, amount: 10 };

            await tx.user.update({
              where: { id: user.id },
              data:
                reward.type === RewardType.gems
                  ? { gems: { increment: reward.amount } }
                  : { xp: { increment: reward.amount } },
            });
          }
        }

        await tx.studyPlanTask.update({
          where: { id: task.id },
          data: {
            status: input.status,
            skipReason,
            completedAt,
            ...(reward && !task.rewardType
              ? { rewardType: reward.type, rewardAmount: reward.amount }
              : {}),
          },
        });

        if (resolvedInputTimeZone && resolvedInputTimeZone !== user.timeZone) {
          await tx.user.update({
            where: { id: user.id },
            data: { timeZone: resolvedInputTimeZone },
          });
        }

        if (!wasDone && isNowDone) {
          const nextCount = calculateNextStreakOnActivity({
            lastActiveDate: user.streak?.lastDate ?? null,
            currentStreak: user.streak?.count ?? 0,
            currentDate: now,
            timeZone,
          });

          await tx.streak.upsert({
            where: { userId: user.id },
            update: {
              count: nextCount,
              lastDate: now,
            },
            create: {
              userId: user.id,
              count: nextCount,
              lastDate: now,
            },
          });
        }

        return { id: input.taskId, status: input.status, skipReason, reward };
      });
    }),
  getRewardBalance: authedProcedure.query(async ({ ctx }) => {
    const user = await prisma.user.findUnique({
      where: { id: ctx.user.id },
      select: { gems: true, xp: true },
    });

    if (!user) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "User not found",
      });
    }

    return { gems: user.gems, xp: user.xp };
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
