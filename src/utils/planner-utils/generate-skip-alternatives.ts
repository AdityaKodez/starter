import {
  NoObjectGeneratedError,
  NoOutputGeneratedError,
  Output,
  generateText,
} from "ai";
import { z } from "zod";
import {
  ReflectionMood,
  ReflectionTaskFeel,
  StudyPlanTaskType,
  Subject,
} from "@/generated/prisma/enums";
import { GOOGLE_MODEL, google } from "@/lib/ai";

export const skipAlternativeSchema = z.object({
  alternatives: z
    .array(
      z.object({
        title: z.string().min(8).max(80),
        durationMinutes: z.number().int().min(5).max(60),
        reason: z.string().min(12).max(160),
      }),
    )
    .length(3),
});

export type SkipAlternativeResult = z.infer<typeof skipAlternativeSchema>;

type SkipAlternativeInput = {
  skipReason: string;
  task: {
    title: string;
    type: StudyPlanTaskType;
    subject: Subject;
    durationMinutes: number;
    reason: string;
    topicName?: string | null;
    chapterName?: string | null;
    topicDifficulty?: string | null;
    topicEstimatedMinutes?: number | null;
  };
  moodData: {
    mood: ReflectionMood;
    taskFeeling: ReflectionTaskFeel;
    createdAt: string;
  }[];
};

function buildSkipAlternativePrompt(input: SkipAlternativeInput) {
  return JSON.stringify(
    {
      instruction:
        "Suggest exactly 3 small alternative study tasks the student can do instead of the skipped task. Adjust timing based on skipReason and moodData. Keep tasks concrete, low-friction, and related to the same subject/chapter when possible. Do not ask the student to do the original full task.",
      timingRules: [
        "No time: suggest 5 to 15 minute alternatives.",
        "Low energy: suggest 10 to 25 minute easy alternatives.",
        "Too hard: suggest 15 to 30 minute prerequisite, example, or breakdown alternatives.",
        "Not interested: suggest 15 to 30 minute alternate-format alternatives.",
        "Never exceed the skipped task duration.",
      ],
      task: input.task,
      skipReason: input.skipReason,
      recentMoodData: input.moodData,
      outputRules: [
        "Return exactly 3 alternatives.",
        "Each title should be action-oriented.",
        "Each reason should explain why it fits the skip reason and mood.",
        "Use 5-minute increments only.",
      ],
    },
    null,
    2,
  );
}

export async function generateSkipAlternatives(
  input: SkipAlternativeInput,
): Promise<SkipAlternativeResult> {
  try {
    const result = await generateText({
      model: google(GOOGLE_MODEL),
      temperature: 0.3,
      output: Output.object({
        schema: skipAlternativeSchema,
        name: "skip_alternatives",
        description: "Three adjusted alternatives for a skipped study task",
      }),
      system:
        "You are a practical JEE study coach. Return only structured alternatives that are easier or shorter than the skipped task.",
      prompt: buildSkipAlternativePrompt(input),
    });

    return result.output;
  } catch (error) {
    if (
      NoObjectGeneratedError.isInstance(error) ||
      NoOutputGeneratedError.isInstance(error)
    ) {
      throw new Error("AI did not return valid skip alternatives", {
        cause: error,
      });
    }

    throw error;
  }
}
