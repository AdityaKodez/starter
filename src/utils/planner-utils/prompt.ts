import type { PlannerPromptInput } from "./schemas";

export function buildPlannerPrompt(input: PlannerPromptInput) {
  return JSON.stringify(
    {
      goal:
        "Create one conservative study plan for today by choosing only from the provided fixed topic ids.",
      rules: [
        "Use only topicId values from topics. Do not invent chapters, topics, or subjects.",
        "Prioritize not_started or weak topics, primary importance, and the weakestSubject.",
        "Keep total task duration close to dailyMinutes without exceeding it.",
        "Prefer 2 to 5 tasks unless dailyMinutes is very small.",
        "Each reason must explain why that topic is selected using onboarding or progress data.",
        "Every task must have type study, revision, or test.",
        "Default to study unless revision or test is clearly supported by the supplied progress data.",
        "Use revision only for topics with in_progress or completed status, low confidence, high mistakesCount, or an old lastRevisedAt.",
        "Do not use revision for not_started topics unless the reason explicitly says it is prerequisite review.",
        "Use test only when it naturally fits after related study or revision, or when dailyMinutes leaves enough time for focused practice.",
        "Do not add tests just to make the plan look balanced.",
        "Add at most one test task.",
        "Prefer at most one revision task unless multiple topics have strong mistake or confidence evidence.",
      ],
      student: {
        dailyMinutes: input.dailyMinutes,
        weakestSubject: input.weakestSubject,
        ...input.onboarding,
      },
      topics: input.topics,
      outputShape: {
        tasks: [
          {
            type: "study",
            topicId: "existing topic id",
            durationMinutes: 45,
            reason: "short reason grounded in the provided data",
          },
        ],
      },
    },
    null,
    2,
  );
}
