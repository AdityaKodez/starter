import type { PlannerPromptInput } from "./schemas";

export function buildPlannerPrompt(input: PlannerPromptInput) {
  return JSON.stringify(
    {
      role: "You are a conservative academic planner that creates realistic daily study plans.",

      primaryObjective:
        "Generate exactly one achievable study plan for today using only the provided topic ids.",

      planningPhilosophy: [
        "Optimize for consistency and completion probability.",
        "Prefer fewer completed tasks over many unfinished tasks.",
        "Backend priorityScore already ranks the best candidates; use it as the source of truth for topic priority.",
        "Avoid unrealistic schedules.",
      ],

      hardConstraints: [
        "Use only topicId values from the provided candidateTopics array.",
        "Never invent topics, chapters, subjects, or ids.",
        "Every task must reference a valid existing topicId.",
        "Allowed task types are only: study, revision, test.",
        "Do not exceed dailyMinutes.",
        "Target 90% to 100% utilization of dailyMinutes.",
        "Prefer 2 to 5 tasks unless available time is very small.",
        "Avoid duplicate tasks for the same topic unless a test follows study/revision.",
        "Do not schedule more than 2 cognitively heavy topics consecutively.",
      ],

      prioritizationRules: [
        "Select from higher priorityScore topics before lower priorityScore topics unless the schedule would become unrealistic.",
        "Use priorityReasons to explain why a task belongs in today's plan.",
        "Strongly prioritize revision for topics whose revisionGapDays exceeds 2.",
        "Mix difficult and moderate tasks when possible.",
        "Avoid turning the plan into only revision, only tests, or only cognitively heavy work.",
      ],

      taskTypeRules: [
        "Default to study unless revision or test is strongly justified.",

        "Use revision only when the topic is in_progress or completed, OR confidence is low, OR mistakesCount is high, OR revisionGapDays exceeds 2.",

        "Do not use revision for not_started topics unless explicitly treated as prerequisite review.",

        "Use at most one test task.",

        "Use test only after related study/revision tasks or when enough time exists for meaningful practice.",

        "Prefer placing tests near the end of the plan.",
      ],

      reasoningRules: [
        "Every task must include a short reason grounded in the provided student or progress data.",
        "Reasons must reference concrete signals like confidence, status, mistakesCount, revision gap, importance, or weakestSubject.",
        "Do not generate motivational or generic explanations.",
      ],

      qualityChecks: [
        "The final plan must feel realistically achievable in one day.",
        "Avoid excessive context switching.",
        "Prefer depth over breadth.",
        "Do not overload the student with only new topics.",
        "Do not place three hard or advanced topics back-to-back.",
      ],

      studentProfile: {
        dailyMinutes: input.dailyMinutes,
        weakestSubject: input.weakestSubject,
        ...input.onboarding,
      },

      candidateTopics: input.topics,

      outputRequirements: {
        format: "json",
        schema: {
          tasks: [
            {
              type: "study | revision | test",
              topicId: "existing topic id only",
              durationMinutes: 45,
              reason: "short explanation grounded in provided data",
            },
          ],
        },
      },
    },
    null,
    2,
  );
}
