import { z } from "zod";
import { StudyPlanTaskType, Subject } from "@/generated/prisma/enums";

export const subjectSchema = z.enum([
  Subject.physics,
  Subject.chemistry,
  Subject.maths,
]);

export const planTaskTypeSchema = z.enum([
  StudyPlanTaskType.study,
  StudyPlanTaskType.revision,
  StudyPlanTaskType.test,
]);

export const generatedPlanSchema = z.object({
  tasks: z
    .array(
      z.object({
        type: planTaskTypeSchema,
        topicId: z.string().min(1),
        durationMinutes: z.number().int().min(15).max(180),
        reason: z.string().min(10).max(240),
        startTime: z.string().min(1),
        endTime: z.string().min(1),
      }),
    )
    .min(1)
    .max(8),
});

export type GeneratedPlan = z.infer<typeof generatedPlanSchema>;

export type TopicForPlanning = {
  id: string;
  subject: Subject;
  chapterName: string;
  topicName: string;
  order: number;
  difficulty: string;
  importance: string;
  estimatedMinutes: number;
  progressStatus: string;
  confidence: number | null;
  mistakesCount: number;
  lastStudiedAt: string | null;
  lastRevisedAt: string | null;
};

export type TopicCandidateForPlanning = TopicForPlanning & {
  priorityScore: number;
  priorityReasons: string[];
  revisionGapDays: number | null;
  isCognitivelyHeavy: boolean;
};

export type TestDeadlineForPlanning = {
  id: string;
  subject: Subject;
  title: string;
  scheduledAt: string;
  daysUntil: number;
  notes: string | null;
};

export type PlannerOnboarding = {
  examYear: number;
  attemptNumber: number | null;
  coachingStart: number | null;
  coachingEnd: number | null;
  schoolStart: number | null;
  schoolEnd: number | null;
  rankAim: number | null;
};

export type PlannerPromptInput = {
  dailyMinutes: number;
  weakestSubject: Subject;
  onboarding: PlannerOnboarding;
  topics: TopicCandidateForPlanning[];
  testDeadlines?: TestDeadlineForPlanning[];
  currentDayOfWeek?: string;
};
