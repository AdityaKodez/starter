import "server-only";

import type { Block } from "@aws-sdk/client-textract";

import { getTextLines } from "@/utils/text-extraction";

const MAX_WORDS_PER_CHUNK = 2_000;
const OVERLAP_WORDS = 200;
const LOW_CONFIDENCE_THRESHOLD = 80;
const SPARSE_PAGE_WORD_THRESHOLD = 25;

type TextLine = ReturnType<typeof getTextLines>[number];

export type DocumentChunkInput = {
  attachmentId: string;
  analysisRunId: string;
  chunkIndex: number;
  pageStart: number;
  pageEnd: number;
  text: string;
  sourceBlockIds: string[];
  confidence: number | null;
  needsVision: boolean;
};

function wordCount(text: string) {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

function averageConfidence(lines: TextLine[]) {
  const confidences = lines
    .map((line) => line.confidence)
    .filter((confidence): confidence is number => typeof confidence === "number");

  if (confidences.length === 0) {
    return null;
  }

  return (
    confidences.reduce((total, confidence) => total + confidence, 0) /
    confidences.length
  );
}

function buildChunk(input: {
  attachmentId: string;
  analysisRunId: string;
  chunkIndex: number;
  lines: TextLine[];
}): DocumentChunkInput {
  const text = input.lines.map((line) => line.text).join("\n");
  const confidence = averageConfidence(input.lines);
  const pageNumbers = input.lines.map((line) => line.page);
  const sourceBlockIds = input.lines
    .map((line) => line.id)
    .filter((id): id is string => Boolean(id));

  return {
    attachmentId: input.attachmentId,
    analysisRunId: input.analysisRunId,
    chunkIndex: input.chunkIndex,
    pageStart: Math.min(...pageNumbers),
    pageEnd: Math.max(...pageNumbers),
    text,
    sourceBlockIds,
    confidence,
    needsVision:
      wordCount(text) < SPARSE_PAGE_WORD_THRESHOLD ||
      (confidence !== null && confidence < LOW_CONFIDENCE_THRESHOLD),
  };
}

export function buildDocumentChunks(input: {
  attachmentId: string;
  analysisRunId: string;
  blocks: Block[];
}) {
  const linesByPage = new Map<number, TextLine[]>();

  for (const line of getTextLines(input.blocks)) {
    const pageLines = linesByPage.get(line.page) ?? [];
    pageLines.push(line);
    linesByPage.set(line.page, pageLines);
  }

  const chunks: DocumentChunkInput[] = [];

  for (const page of Array.from(linesByPage.keys()).sort((a, b) => a - b)) {
    const lines = linesByPage.get(page) ?? [];
    let currentLines: TextLine[] = [];
    let currentWordCount = 0;

    for (const line of lines) {
      const lineWordCount = wordCount(line.text);

      if (
        currentLines.length > 0 &&
        currentWordCount + lineWordCount > MAX_WORDS_PER_CHUNK
      ) {
        chunks.push(
          buildChunk({
            attachmentId: input.attachmentId,
            analysisRunId: input.analysisRunId,
            chunkIndex: chunks.length,
            lines: currentLines,
          }),
        );

        const overlapLines: TextLine[] = [];
        let overlapWordCount = 0;

        for (let index = currentLines.length - 1; index >= 0; index -= 1) {
          const overlapLine = currentLines[index];
          overlapLines.unshift(overlapLine);
          overlapWordCount += wordCount(overlapLine.text);

          if (overlapWordCount >= OVERLAP_WORDS) {
            break;
          }
        }

        currentLines = overlapLines;
        currentWordCount = overlapWordCount;
      }

      currentLines.push(line);
      currentWordCount += lineWordCount;
    }

    if (currentLines.length > 0) {
      chunks.push(
        buildChunk({
          attachmentId: input.attachmentId,
          analysisRunId: input.analysisRunId,
          chunkIndex: chunks.length,
          lines: currentLines,
        }),
      );
    }
  }

  return chunks;
}
