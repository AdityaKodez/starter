import { Subject } from "@/generated/prisma/enums";
import type { TopicForPlanning } from "./schemas";

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
