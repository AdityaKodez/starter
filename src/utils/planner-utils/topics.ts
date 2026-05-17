import { Subject } from "@/generated/prisma/enums";
import { differenceInDays } from "date-fns";
import type {
  TestDeadlineForPlanning,
  TopicCandidateForPlanning,
  TopicForPlanning,
} from "./schemas";
const DEFAULT_CANDIDATE_LIMIT = 27;

type ChapterTopicProgress = {
  status: string | null;
  confidence: number | null;
  mistakesCount: number;
  lastStudiedAt: Date | null;
  lastRevisedAt: Date | null;
};

type ChapterTopic = {
  id: string;
  order: number
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
  now?: Date;
  limit?: number;
};

export function buildRankedTopicCandidates({
  topics,
  weakestSubject,
  testDeadlines = [],
  now = new Date(),
  limit = DEFAULT_CANDIDATE_LIMIT,
}: BuildRankedTopicCandidatesInput): TopicCandidateForPlanning[] {
 const scored = topics.map((topic) =>
  scoreTopicCandidate(topic, weakestSubject, now, testDeadlines),
 );
 const grouped = new Map<Subject, TopicCandidateForPlanning[]>()
 for (const topic of scored) {
  if(!grouped.has(topic.subject)) {
   grouped.set(topic.subject, []);
  }
  grouped.get(topic.subject)!.push(topic);
 }
 for (const pool of grouped.values()) {
  pool.sort((a,b) => b.priorityScore - a.priorityScore || a.order - b.order)
 }
 const subjects = [...grouped.keys()]
 const result: TopicCandidateForPlanning[] = []

 while (result.length < limit) {
  let added = 0
  for (const subject of subjects) {
    const pool = grouped.get(subject)!
    if (!pool.length) continue
    result.push(pool.shift()!)
    added++
  }
  if (added === 0) break
}
return result.slice(0, limit);
}

function scoreTopicCandidate(
  topic: TopicForPlanning,
  weakestSubject: Subject,
  now: Date,
  testDeadlines: TestDeadlineForPlanning[],
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
    priorityScore += 10;
    reasons.push("weakest subject");
  }

  const nearestDeadline = testDeadlines
    .filter((deadline) => deadline.subject === topic.subject && deadline.daysUntil >= 0)
    .sort((a, b) => a.daysUntil - b.daysUntil)[0];

  if (nearestDeadline && nearestDeadline.daysUntil <= 14) {
    const deadlineBoost =
      nearestDeadline.daysUntil <= 3
        ? 35
        : Math.max(10, 28 - nearestDeadline.daysUntil);
    priorityScore += deadlineBoost;
    reasons.push(
      nearestDeadline.daysUntil === 0
        ? `test deadline today: ${nearestDeadline.title}`
        : `test deadline in ${nearestDeadline.daysUntil} days: ${nearestDeadline.title}`,
    );
  }
const isColdStart = topic.lastStudiedAt === null && topic.mistakesCount === 0
if (isColdStart) {
  priorityScore -= topic.order * 2
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
