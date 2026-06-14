import type { PlannerPromptInput } from "./schemas";

const MOOD_GUIDANCE: Record<string, string> = {
  low: "Student reported LOW energy/mood yesterday. Reduce cognitive load: target the lower end of dailyMinutes (around 70-80%), prefer revision and familiar/easier topics, avoid new cognitively heavy topics, keep tasks shorter (favor 15-40 min blocks), and schedule at most one moderately hard task. Do NOT pile on new material.",
  okay: "Student reported an OKAY mood yesterday. Use balanced, default planning: normal dailyMinutes utilization with a healthy mix of study and revision.",
  good: "Student reported GOOD energy/mood yesterday. The student can handle more: push toward full dailyMinutes utilization, include cognitively heavy or advanced topics earlier in the day, and introduce new high-priority material confidently.",
};

const TASK_FEELING_GUIDANCE: Record<string, string> = {
  too_easy:
    "Yesterday's tasks felt TOO EASY. Slightly increase difficulty: prefer harder/advanced topics, allow marginally longer durations, and lean toward new material over repeated revision.",
  right_level:
    "Yesterday's tasks felt at the RIGHT LEVEL. Maintain a similar difficulty and duration balance.",
  too_hard:
    "Yesterday's tasks felt TOO HARD. Reduce difficulty: prefer easier topics and revision of already-seen material, shorten durations slightly, and avoid back-to-back hard topics.",
};

export function buildPlannerPrompt(input: PlannerPromptInput) {
  const reflection = input.lastReflection ?? null;
  const moodAdaptation = reflection
    ? {
        note: "Adapt today's plan based on the student's most recent self-reported reflection. This is a soft signal: never violate hardConstraints, valid topicIds, or scheduling/timing rules to honor it.",
        reportedMood: reflection.mood,
        reportedTaskFeeling: reflection.taskFeeling,
        moodInstruction: MOOD_GUIDANCE[reflection.mood],
        taskFeelingInstruction: TASK_FEELING_GUIDANCE[reflection.taskFeeling],
      }
    : {
        note: "No recent reflection is available. Use balanced default planning.",
      };

  return JSON.stringify(
    {
      role: "You are a conservative academic planner that creates realistic daily study plans.",

      primaryObjective:
        "Generate exactly one achievable study plan for today using only the provided topic ids.",

      planningPhilosophy: [
        "Optimize for consistency and completion probability.",
        "Prefer fewer completed tasks over many unfinished tasks.",
        "Backend priorityScore already ranks the best candidates using weakness, deadlines, progress, and historical completion fit; use it as the source of truth for topic priority.",
        "Adapt difficulty, volume, and task-type mix to the student's most recent reflection in moodAdaptation, without breaking any hardConstraints.",
        "Avoid unrealistic schedules.",
      ],

      hardConstraints: [
        "Use only topicId values from the provided candidateTopics array.",
        "Never invent topics, chapters, subjects, or ids.",
        "Every task must reference a valid existing topicId.",
        "Allowed task types are only: study, revision, test.",
        "Do not exceed dailyMinutes.",
        "Include atleast 2 different subjects if available time allows.",
        "Target 90% to 100% utilization of dailyMinutes.",
        "Prefer 2 to 5 tasks unless available time is very small.",
        "Do not schedule duplicate tasks for the same topic unless a test follows study/revision.",
        "Do not schedule more than 2 cognitively heavy topics consecutively.",
        "The current day of the week is provided in `currentDayOfWeek`.",
        "All study tasks must have sequential non-overlapping `startTime` and `endTime` (e.g. Task 1 starts and ends, then Task 2 starts). Leave reasonable buffer space or start next task immediately.",
        "Do not schedule tasks during coaching/tuition hours (from coachingStart to coachingEnd, e.g. 9 for 9:00 AM to 17 for 5:00 PM). This coaching restriction applies on ALL days.",
        "Do not schedule tasks during school hours (from schoolStart to schoolEnd, e.g. 8 for 8:00 AM to 14 for 2:00 PM) on weekdays and Saturdays.",
        "Sunday Exception: If currentDayOfWeek is 'Sunday', DO NOT take school timing into account (since school is closed on Sundays). Only coaching/tuition timing restriction applies on Sunday.",
        "The duration of each task (endTime minus startTime) must exactly equal `durationMinutes`.",
        "Return startTime and endTime in standard 'hh:mm AM/PM' format (e.g., '08:00 AM', '10:30 AM', '02:00 PM').",
      ],

      prioritizationRules: [
        "Select from higher priorityScore topics before lower priorityScore topics unless the schedule would become unrealistic.",
        "Use priorityReasons to explain why a task belongs in today's plan.",
        "Upcoming test deadlines are strongly reflected in priorityScore; do not skip a deadline subject just because another subject has a slightly better completion fit.",
        "For deadlines within 3 days, strongly prefer revision or practice for that subject over unrelated optional new topics.",
        "Prefer topics with positive completionScore when two candidates are otherwise similarly urgent.",
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

      durationRules: [
        "Set durationMinutes using estimatedMinutes as the baseline.",
        "Increase time for hard or advanced topics, low confidence, high mistakesCount, or large revisionGapDays.",
        "Reduce time for completed or high-confidence topics, and keep revision slightly shorter than study when possible.",
        "Apply a small fatigue effect: later tasks should be slightly shorter than early tasks.",
        "Use 5-minute increments, keep each task between 15 and 180 minutes.",
      ],

      reasoningRules: [
        "Every task must include a short reason grounded in the provided student or progress data.",
        "Reasons must reference concrete signals like confidence, status, mistakesCount, revision gap, importance, weakestSubject, deadline, or completion fit.",
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
        currentDayOfWeek: input.currentDayOfWeek,
        ...input.onboarding,
      },

      upcomingTestDeadlines: input.testDeadlines ?? [],

      moodAdaptation,

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
              startTime: "hh:mm AM/PM (e.g., 08:00 AM)",
              endTime: "hh:mm AM/PM (e.g., 09:30 AM)",
            },
          ],
        },
      },
    },
    null,
    2,
  );
}
