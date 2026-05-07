import { TRPCError } from "@trpc/server";
import type { Subject } from "@/generated/prisma/enums";
import {
  subjectSchema,
  type GeneratedPlan,
  type TopicForPlanning,
} from "./schemas";

type PlannerTask = {
  subject: Subject;
  title: string;
  durationMinutes: number;
  reason: string;
  order: number;
};

type BuildPlanTasksInput = {
  generatedPlan: GeneratedPlan;
  topicsForPlanning: TopicForPlanning[];
  dailyMinutes: number;
};

export function buildPlanTasks(
  input: BuildPlanTasksInput,
): { tasks: PlannerTask[]; totalMinutes: number } {
  const { generatedPlan, topicsForPlanning, dailyMinutes } = input;
  const topicById = new Map(topicsForPlanning.map((topic) => [topic.id, topic]));
  const seenTopicIds = new Set<string>();
  const tasks = generatedPlan.tasks.map((task, index) => {
    const topic = topicById.get(task.topicId);

    if (!topic) {
      throw new TRPCError({
        code: "BAD_GATEWAY",
        message: `AI returned an unknown topic id: ${task.topicId}`,
      });
    }

    if (seenTopicIds.has(task.topicId)) {
      throw new TRPCError({
        code: "BAD_GATEWAY",
        message: `AI returned duplicate topic id: ${task.topicId}`,
      });
    }

    seenTopicIds.add(task.topicId);

    return {
      subject: subjectSchema.parse(topic.subject),
      title: `${topic.chapterName}: ${topic.topicName}`,
      durationMinutes: task.durationMinutes,
      reason: task.reason,
      order: index + 1,
    };
  });

  const totalMinutes = tasks.reduce(
    (sum, task) => sum + task.durationMinutes,
    0,
  );

  if (totalMinutes > dailyMinutes) {
    throw new TRPCError({
      code: "BAD_GATEWAY",
      message: "AI generated a plan that exceeds the available study time",
    });
  }

  return { tasks, totalMinutes };
}
