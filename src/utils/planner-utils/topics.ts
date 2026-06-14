import { Subject } from "@/generated/prisma/enums";
import { differenceInDays } from "date-fns";
import type {
  PlannerCompletionStats,
  TestDeadlineForPlanning,
  TopicCandidateForPlanning,
  TopicForPlanning,
} from "./schemas";
const DEFAULT_CANDIDATE_LIMIT = 27;
const WEAK_SUBJECT_BOOST = 24;
const URGENT_DEADLINE_BOOST = 52;
const MIN_COMPLETION_ATTEMPTS = 3;

type ChapterTopicProgress = {
  status: string | null;
  confidence: number | null;
  mistakesCount: number;
  lastStudiedAt: Date | null;
  lastRevisedAt: Date | null;
};

type ChapterTopic = {
  id: string;
  order: number;
  name: string;
  difficulty: string;
  importance: string;
  estimatedMinutes: number;
  userProgress: ChapterTopicProgress[];
};

type ChapterWithTopics = {
  subject: Subject;
  name: string;
  topics: ChapterTopic[];
};

export function buildTopicsForPlanning(
  chaptersWithTopics: ChapterWithTopics[],
): TopicForPlanning[] {
  return chaptersWithTopics.flatMap((chapter) =>
    chapter.topics.map((topic) => {
      const progress = topic.userProgress[0];
      return {
        id: topic.id,
        subject: chapter.subject,
        chapterName: chapter.name,
        topicName: topic.name,
        difficulty: topic.difficulty,
        importance: topic.importance,
        estimatedMinutes: topic.estimatedMinutes,
        progressStatus: progress?.status ?? "not_started",
        confidence: progress?.confidence ?? null,
        mistakesCount: progress?.mistakesCount ?? 0,
        lastStudiedAt: progress?.lastStudiedAt?.toISOString() ?? null,
        lastRevisedAt: progress?.lastRevisedAt?.toISOString() ?? null,
        order: topic.order,
      };
    }),
  );
}

type BuildRankedTopicCandidatesInput = {
  topics: TopicForPlanning[];
  weakestSubject: Subject;
  testDeadlines?: TestDeadlineForPlanning[];
  completionStats?: PlannerCompletionStats;
  now?: Date;
  limit?: number;
};

export function buildRankedTopicCandidates({
  topics,
  weakestSubject,
  testDeadlines = [],
  completionStats,
  now = new Date(),
  limit = DEFAULT_CANDIDATE_LIMIT,
}: BuildRankedTopicCandidatesInput): TopicCandidateForPlanning[] {
  return topics
    .map((topic) =>
      scoreTopicCandidate(
        topic,
        weakestSubject,
        now,
        testDeadlines,
        completionStats,
      ),
    )
    .sort((a, b) => b.priorityScore - a.priorityScore || a.order - b.order)
    .slice(0, limit);
}

function scoreTopicCandidate(
  topic: TopicForPlanning,
  weakestSubject: Subject,
  now: Date,
  testDeadlines: TestDeadlineForPlanning[],
  completionStats?: PlannerCompletionStats,
): TopicCandidateForPlanning {
  const reasons: string[] = [];

  const revisionGapDays = topic.lastRevisedAt
    ? differenceInDays(now, topic.lastRevisedAt)
    : null;
  const lastStudiedGapDays = topic.lastStudiedAt
    ? differenceInDays(now, topic.lastStudiedAt)
    : null;
  const isCognitivelyHeavy =
    topic.difficulty === "hard" || topic.difficulty === "advanced";

  let priorityScore = 0;

  if (topic.subject === weakestSubject) {
    priorityScore += WEAK_SUBJECT_BOOST;
    reasons.push("weakest subject");
  }

  const nearestDeadline = testDeadlines
    .filter(
      (deadline) => deadline.subject === topic.subject && deadline.daysUntil >= 0,
    )
    .sort((a, b) => a.daysUntil - b.daysUntil)[0];

  if (nearestDeadline && nearestDeadline.daysUntil <= 14) {
    const deadlineBoost =
      nearestDeadline.daysUntil <= 3
        ? URGENT_DEADLINE_BOOST
        : Math.max(24, 42 - nearestDeadline.daysUntil);
    priorityScore += deadlineBoost;
    reasons.push(
      nearestDeadline.daysUntil === 0
        ? `test deadline today: ${nearestDeadline.title}`
        : `test deadline in ${nearestDeadline.daysUntil} days: ${nearestDeadline.title}`,
    );
  }
  const isColdStart = topic.lastStudiedAt === null && topic.mistakesCount === 0;
  if (isColdStart) {
    priorityScore -= topic.order * 2;
  }
  const importanceWeight = getImportanceWeight(topic.importance);
  priorityScore += importanceWeight;
  if (importanceWeight > 0) reasons.push(`${topic.importance} importance`);

  const statusWeight = getStatusWeight(topic.progressStatus);
  priorityScore += statusWeight;
  if (statusWeight > 0) reasons.push(topic.progressStatus);

  if (revisionGapDays !== null && revisionGapDays > 2) {
    const revisionUrgency = Math.min(25, 10 + (revisionGapDays - 2) * 5);
    priorityScore += revisionUrgency;
    reasons.push(`revision gap ${revisionGapDays} days`);
  }

  const confidencePenalty = getConfidencePenalty(topic.confidence);
  priorityScore += confidencePenalty;
  if (confidencePenalty > 0) reasons.push(`confidence ${topic.confidence}`);

  const mistakesPenalty = Math.min(20, topic.mistakesCount * 5);
  priorityScore += mistakesPenalty;
  if (mistakesPenalty > 0) reasons.push(`${topic.mistakesCount} mistakes`);

  if (lastStudiedGapDays !== null && lastStudiedGapDays > 5) {
    priorityScore += 5;
    reasons.push(`last studied ${lastStudiedGapDays} days ago`);
  }

  if (isCognitivelyHeavy) {
    priorityScore += topic.importance === "primary" ? 5 : 2;
    reasons.push("cognitively heavy");
  }

  const completionFit = getCompletionFit(topic, completionStats);
  priorityScore += completionFit.score;
  if (completionFit.reason) reasons.push(completionFit.reason);

  return {
    ...topic,
    priorityScore,
    priorityReasons: reasons,
    revisionGapDays,
    isCognitivelyHeavy,
    completionRate: completionFit.rate,
    completionAttempts: completionFit.attempts,
    completionScore: completionFit.score,
  };
}

function getImportanceWeight(importance: string) {
  if (importance === "primary") return 12;
  if (importance === "secondary") return 10;
  return 0;
}

function getStatusWeight(status: string) {
  if (status === "in_progress") return 16;
  if (status === "not_started") return 10;
  if (status === "completed") return 4;
  return 0;
}

function getConfidencePenalty(confidence: number | null) {
  if (confidence === null) return 0;
  if (confidence <= 2) return 20;
  if (confidence === 3) return 12;
  if (confidence === 4) return 5;
  return 0;
}

function getCompletionFit(
  topic: TopicForPlanning,
  completionStats?: PlannerCompletionStats,
) {
  const topicRate = completionStats?.topicRates[topic.id];
  const subjectRate = completionStats?.subjectRates[topic.subject];
  const bestRate =
    topicRate && topicRate.attempts >= MIN_COMPLETION_ATTEMPTS
      ? topicRate
      : subjectRate && subjectRate.attempts >= MIN_COMPLETION_ATTEMPTS
        ? subjectRate
        : null;

  const durationScore = getDurationCompletionScore(topic.estimatedMinutes);

  if (!bestRate) {
    return {
      score: durationScore,
      rate: null,
      attempts: 0,
      reason:
        durationScore > 0
          ? "completion fit: manageable duration"
          : durationScore < 0
            ? "completion fit: long task"
            : null,
    };
  }

  const rateScore = getCompletionRateScore(bestRate.rate);
  const score = rateScore + durationScore;
  const percent = Math.round(bestRate.rate * 100);

  return {
    score,
    rate: bestRate.rate,
    attempts: bestRate.attempts,
    reason:
      score > 0
        ? `completion fit: ${percent}% completion over ${bestRate.attempts} attempts`
        : score < 0
          ? `completion risk: ${percent}% completion over ${bestRate.attempts} attempts`
          : null,
  };
}

function getCompletionRateScore(rate: number) {
  if (rate >= 0.8) return 14;
  if (rate >= 0.65) return 9;
  if (rate >= 0.5) return 4;
  if (rate < 0.35) return -8;
  return -3;
}

function getDurationCompletionScore(estimatedMinutes: number) {
  if (estimatedMinutes <= 45) return 5;
  if (estimatedMinutes <= 75) return 2;
  if (estimatedMinutes >= 150) return -5;
  if (estimatedMinutes >= 120) return -3;
  return 0;
}
