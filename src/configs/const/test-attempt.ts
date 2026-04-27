import { TestAttemptStatus, TestAttemptType } from "@/generated/prisma/enums";

export const TEST_ATTEMPT_DEFAULT_PAGE_SIZE = 10;
export const TEST_ATTEMPT_MAX_PAGE_SIZE = 50;

export const TEST_ATTEMPT_TYPE_VALUES = [
  TestAttemptType.MOCK_TEST,
  TestAttemptType.PAST_PAPER,
  TestAttemptType.SECTIONAL_TEST,
  TestAttemptType.CHAPTER_TEST,
  TestAttemptType.PRACTICE_SET,
  TestAttemptType.LOOSE_PRACTICE,
] as const;

export const TEST_ATTEMPT_STATUS_VALUES = [
  TestAttemptStatus.IN_PROGRESS,
  TestAttemptStatus.COMPLETED,
  TestAttemptStatus.ARCHIVED,
] as const;

export const TEST_ATTEMPT_VIEW_SELECT = {
  id: true,
  title: true,
  examName: true,
  sourceName: true,
  sourceYear: true,
  type: true,
  status: true,
  attemptedAt: true,
  durationSeconds: true,
  totalQuestions: true,
  correctCount: true,
  incorrectCount: true,
  skippedCount: true,
  score: true,
  maxScore: true,
  createdAt: true,
};
