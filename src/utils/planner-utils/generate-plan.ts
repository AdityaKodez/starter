import {
  NoObjectGeneratedError,
  NoOutputGeneratedError,
  Output,
  generateText,
} from "ai";
import { TRPCError } from "@trpc/server";
import { GOOGLE_MODEL, google } from "@/lib/ai";
import { buildPlannerPrompt } from "./prompt";
import {
  generatedPlanSchema,
  type GeneratedPlan,
  type PlannerPromptInput,
} from "./schemas";

export async function generateStudyPlan(
  input: PlannerPromptInput,
): Promise<GeneratedPlan> {
  try {
    const result = await generateText({
      model: google(GOOGLE_MODEL),
      temperature: 0.2,
      output: Output.object({
        schema: generatedPlanSchema,
        name: "study_plan",
        description: "A typed topic-id based study plan for today",
      }),
      system:
        "You are a conservative JEE study planner. Return only a valid structured plan grounded in the supplied fixed syllabus, onboarding data, and topic progress. Do not overuse revision or test tasks.",
      prompt: buildPlannerPrompt(input),
    });

    return result.output;
  } catch (error) {
    if (
      NoObjectGeneratedError.isInstance(error) ||
      NoOutputGeneratedError.isInstance(error)
    ) {
      throw new TRPCError({
        code: "BAD_GATEWAY",
        message: "AI did not return a valid study plan",
        cause: error,
      });
    }

    throw error;
  }
}
