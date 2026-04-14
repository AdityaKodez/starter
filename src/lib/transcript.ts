import type { TranscriptResponse } from "@danielxceron/youtube-transcript";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";

export type PersistableTranscriptChunk = {
  chunkIndex: number;
  text: string;
  startTime: number;
  endTime: number;
  tokenCount: number;
};

type NormalizedTranscriptSegment = {
  text: string;
  startTime: number;
  endTime: number;
  startChar: number;
  endChar: number;
};

type ChunkTranscriptOptions = {
  chunkSize?: number;
  chunkOverlap?: number;
};

function normalizeTranscriptItems(items: TranscriptResponse[]) {
  const rawSegments = items
    .map((item) => {
      const text = item.text.replace(/\s+/g, " ").trim();
      if (text.length === 0) return null;

      const startTime = Math.max(0, Math.floor(item.offset));
      const endTime = Math.max(startTime, Math.ceil(item.offset + item.duration));

      return {
        text,
        startTime,
        endTime,
      };
    })
    .filter((segment): segment is NonNullable<typeof segment> => segment !== null);

  const segments: NormalizedTranscriptSegment[] = [];
  const textParts: string[] = [];
  let cursor = 0;

  for (const segment of rawSegments) {
    if (textParts.length > 0) {
      cursor += 1;
    }

    const startChar = cursor;
    const endChar = startChar + segment.text.length;
    cursor = endChar;

    textParts.push(segment.text);
    segments.push({
      ...segment,
      startChar,
      endChar,
    });
  }

  return {
    fullText: textParts.join(" "),
    segments,
  };
}

function estimateTokenCount(text: string) {
  const wordCount = text.split(/\s+/).filter((word) => word.length > 0).length;
  return Math.max(1, Math.ceil(wordCount * 1.35));
}

function resolveChunkTimes(params: {
  startChar: number;
  endChar: number;
  segments: NormalizedTranscriptSegment[];
}) {
  const { startChar, endChar, segments } = params;
  const overlappingSegments = segments.filter(
    (segment) => segment.endChar > startChar && segment.startChar < endChar,
  );

  if (overlappingSegments.length > 0) {
    return {
      startTime: overlappingSegments[0].startTime,
      endTime: overlappingSegments[overlappingSegments.length - 1].endTime,
    };
  }

  const fallback = segments.find((segment) => segment.startChar >= startChar) ?? segments[segments.length - 1];
  return {
    startTime: fallback.startTime,
    endTime: fallback.endTime,
  };
}

export async function buildTranscriptChunks(params: {
  transcriptItems: TranscriptResponse[];
  options?: ChunkTranscriptOptions;
}) {
  const { transcriptItems, options } = params;
  const { fullText, segments } = normalizeTranscriptItems(transcriptItems);

  if (segments.length === 0 || fullText.length === 0) {
    return {
      fullText: "",
      chunks: [] as PersistableTranscriptChunk[],
    };
  }

  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: options?.chunkSize ?? 2400,
    chunkOverlap: options?.chunkOverlap ?? 280,
  });

  const rawChunks = await splitter.splitText(fullText);

  let searchCursor = 0;
  const chunks: PersistableTranscriptChunk[] = [];

  for (const rawChunk of rawChunks) {
    const text = rawChunk.trim();
    if (text.length === 0) continue;

    const foundAt = fullText.indexOf(text, searchCursor);
    const startChar = foundAt >= 0 ? foundAt : searchCursor;
    const endChar = Math.min(fullText.length, startChar + text.length);
    searchCursor = endChar;

    const { startTime, endTime } = resolveChunkTimes({
      startChar,
      endChar,
      segments,
    });

    chunks.push({
      chunkIndex: chunks.length,
      text,
      startTime,
      endTime,
      tokenCount: estimateTokenCount(text),
    });
  }

  return {
    fullText,
    chunks,
  };
}