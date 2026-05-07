import { z } from "zod";
import { Subject } from "@/generated/prisma/enums";

export const subjectSchema = z.enum([
  Subject.physics,
  Subject.chemistry,
  Subject.maths,
]);

export const generatedPlanSchema = z.object({
  tasks: z
    .array(
      z.object({
        topicId: z.string().min(1),
        durationMinutes: z.number().int().min(15).max(180),
        reason: z.string().min(10).max(240),
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
  difficulty: string;
  importance: string;
  estimatedMinutes: number;
  progressStatus: string;
  confidence: number | null;
  mistakesCount: number;
  lastStudiedAt: string | null;
  lastRevisedAt: string | null;
};

export type PlannerOnboarding = {
  examYear: number;
  attemptNumber: number | null;
  coachingStart: number | null;
  coachingEnd: number | null;
  rankAim: number | null;
};

export type PlannerPromptInput = {
  dailyMinutes: number;
  weakestSubject: Subject;
  onboarding: PlannerOnboarding;
  topics: TopicForPlanning[];
};
