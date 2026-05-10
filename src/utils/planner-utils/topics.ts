import { Subject } from "@/generated/prisma/enums";
import type { TopicCandidateForPlanning, TopicForPlanning } from "./schemas";

const DAY_IN_MS = 24 * 60 * 60 * 1000;
const DEFAULT_CANDIDATE_LIMIT = 15;

type ChapterTopicProgress = {
  status: string | null;
  confidence: number | null;
  mistakesCount: number;
  lastStudiedAt: Date | null;
  lastRevisedAt: Date | null;
};

type ChapterTopic = {
  id: string;
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
      };
    }),
  );
}

type BuildRankedTopicCandidatesInput = {
  topics: TopicForPlanning[];
  weakestSubject: Subject;
  now?: Date;
  limit?: number;
};

export function buildRankedTopicCandidates({
  topics,
  weakestSubject,
  now = new Date(),
  limit = DEFAULT_CANDIDATE_LIMIT,
}: BuildRankedTopicCandidatesInput): TopicCandidateForPlanning[] {
  return topics
    .map((topic) => scoreTopicCandidate(topic, weakestSubject, now))
    .sort((left, right) => {
      if (right.priorityScore !== left.priorityScore) {
        return right.priorityScore - left.priorityScore;
      }

      if (left.subject === weakestSubject && right.subject !== weakestSubject) {
        return -1;
      }

      if (right.subject === weakestSubject && left.subject !== weakestSubject) {
        return 1;
      }

      return left.estimatedMinutes - right.estimatedMinutes;
    })
    .slice(0, limit);
}

function scoreTopicCandidate(
  topic: TopicForPlanning,
  weakestSubject: Subject,
  now: Date,
): TopicCandidateForPlanning {
  const reasons: string[] = [];
  const revisionGapDays = getAgeInDays(topic.lastRevisedAt, now);
  const lastStudiedGapDays = getAgeInDays(topic.lastStudiedAt, now);
  const isCognitivelyHeavy =
    topic.difficulty === "hard" || topic.difficulty === "advanced";

  let priorityScore = 0;

  if (topic.subject === weakestSubject) {
    priorityScore += 25;
    reasons.push("weakest subject");
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

  return {
    ...topic,
    priorityScore,
    priorityReasons: reasons,
    revisionGapDays,
    isCognitivelyHeavy,
  };
}

function getImportanceWeight(importance: string) {
  if (importance === "primary") return 20;
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

function getAgeInDays(value: string | null, now: Date) {
  if (!value) return null;

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return null;

  return Math.max(0, Math.floor((now.getTime() - date.getTime()) / DAY_IN_MS));
}
