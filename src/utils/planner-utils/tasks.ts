import { TRPCError } from "@trpc/server";
import { StudyPlanTaskType, type Subject } from "@/generated/prisma/enums";
import {
  subjectSchema,
  type GeneratedPlan,
  type TopicForPlanning,
} from "./schemas";

const REVISION_URGENCY_DAYS = 2;

type PlannerTask = {
  topicId: string;
  type: StudyPlanTaskType;
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
  const seenTopicTypes = new Map<string, Set<StudyPlanTaskType>>();
  let testTaskCount = 0;
  let revisionTaskCount = 0;
  const tasks = generatedPlan.tasks.map((task, index) => {
    const topic = topicById.get(task.topicId);

    if (!topic) {
      throw new TRPCError({
        code: "BAD_GATEWAY",
        message: `AI returned an unknown topic id: ${task.topicId}`,
      });
    }

    const seenTypes = seenTopicTypes.get(task.topicId) ?? new Set();
    const isAllowedStudyThenTestDuplicate =
      task.type === StudyPlanTaskType.test &&
      (seenTypes.has(StudyPlanTaskType.study) ||
        seenTypes.has(StudyPlanTaskType.revision));

    if (seenTypes.size > 0 && !isAllowedStudyThenTestDuplicate) {
      throw new TRPCError({
        code: "BAD_GATEWAY",
        message: `AI returned duplicate topic id without a valid study/revision then test sequence: ${task.topicId}`,
      });
    }

    if (task.type === StudyPlanTaskType.test) {
      testTaskCount += 1;
    }

    if (task.type === StudyPlanTaskType.revision) {
      validateRevisionTask(task, topic);
      revisionTaskCount += 1;
    }

    seenTypes.add(task.type);
    seenTopicTypes.set(task.topicId, seenTypes);

    return {
      topicId: task.topicId,
      type: task.type,
      subject: subjectSchema.parse(topic.subject),
      title: buildTaskTitle(task.type, topic),
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

  if (testTaskCount > 1) {
    throw new TRPCError({
      code: "BAD_GATEWAY",
      message: "AI generated too many test tasks for one day",
    });
  }

  if (revisionTaskCount > 1 && !hasStrongRevisionEvidence(tasks, topicById)) {
    throw new TRPCError({
      code: "BAD_GATEWAY",
      message: "AI generated too many revision tasks without strong progress evidence",
    });
  }

  validateCognitiveLoad(tasks, topicById);

  return { tasks, totalMinutes };
}

function buildTaskTitle(type: StudyPlanTaskType, topic: TopicForPlanning) {
  const title = `${topic.chapterName}: ${topic.topicName}`;

  if (type === StudyPlanTaskType.revision) {
    return `Revise: ${title}`;
  }

  if (type === StudyPlanTaskType.test) {
    return `Practice test: ${title}`;
  }

  return title;
}

function hasStrongRevisionEvidence(
  tasks: PlannerTask[],
  topicById: Map<string, TopicForPlanning>,
) {
  return tasks
    .filter((task) => task.type === StudyPlanTaskType.revision)
    .every((task) => {
      const topic = topicById.get(task.topicId);

      if (!topic) return false;

      return (
        topic.progressStatus === "in_progress" ||
        topic.progressStatus === "completed" ||
        (topic.confidence !== null && topic.confidence <= 2) ||
        topic.mistakesCount >= 2 ||
        getRevisionGapDays(topic) > REVISION_URGENCY_DAYS
      );
    });
}

function validateRevisionTask(
  task: GeneratedPlan["tasks"][number],
  topic: TopicForPlanning,
) {
  const hasProgressEvidence =
    topic.progressStatus === "in_progress" ||
    topic.progressStatus === "completed" ||
    (topic.confidence !== null && topic.confidence <= 2) ||
    topic.mistakesCount > 0 ||
    getRevisionGapDays(topic) > REVISION_URGENCY_DAYS ||
    topic.lastStudiedAt !== null;

  const mentionsPrerequisiteReview =
    task.reason.toLowerCase().includes("prerequisite");

  if (!hasProgressEvidence && !mentionsPrerequisiteReview) {
    throw new TRPCError({
      code: "BAD_GATEWAY",
      message:
        "AI generated a revision task without progress evidence or prerequisite context",
    });
  }
}

function validateCognitiveLoad(
  tasks: PlannerTask[],
  topicById: Map<string, TopicForPlanning>,
) {
  let consecutiveHeavyTasks = 0;

  for (const task of tasks) {
    const topic = topicById.get(task.topicId);
    const isHeavy =
      topic?.difficulty === "hard" || topic?.difficulty === "advanced";

    consecutiveHeavyTasks = isHeavy ? consecutiveHeavyTasks + 1 : 0;

    if (consecutiveHeavyTasks > 2) {
      throw new TRPCError({
        code: "BAD_GATEWAY",
        message:
          "AI generated too many cognitively heavy topics consecutively",
      });
    }
  }
}

function getRevisionGapDays(topic: TopicForPlanning) {
  if (!topic.lastRevisedAt) return 0;

  const lastRevisedAt = new Date(topic.lastRevisedAt);

  if (Number.isNaN(lastRevisedAt.getTime())) return 0;

  const dayInMs = 24 * 60 * 60 * 1000;

  return Math.max(
    0,
    Math.floor((Date.now() - lastRevisedAt.getTime()) / dayInMs),
  );
}
