import "server-only";

import { generateText, Output } from "ai";
import { z } from "zod";

import { google, GOOGLE_MODEL } from "@/lib/ai";

const mistakeTypeEnum = z.enum([
  "CONCEPTUAL",
  "SILLY",
  "CALCULATION",
  "MISREAD",
  "UNKNOWN",
]);

const analysisResultSchema = z.object({
  mistakes: z.array(
    z.object({
      type: mistakeTypeEnum,
      description: z.string(),
      topic: z.string(),
      confidence: z.number().min(0).max(1).nullable(),
    }),
  ),
});

export type ChunkAnalysisInput = {
  chunkIndex: number;
  text: string;
  pageStart: number;
  pageEnd: number;
};

export type AnalysedMistake = {
  type: z.infer<typeof mistakeTypeEnum>;
  description: string;
  topic: string;
  confidence: number | null;
};

const SYSTEM_PROMPT = `You are an expert exam performance analyst. You analyze OCR-extracted text from student exam answer sheets to identify mistakes the student made.

For each mistake you find, classify it as one of:
- CONCEPTUAL: The student misunderstood the underlying concept or theory.
- SILLY: A careless error such as copying the wrong option, skipping a step, or sign errors.
- CALCULATION: An arithmetic or algebraic computation error.
- MISREAD: The student misread the question, misinterpreted what was being asked, or confused similar-looking values.
- UNKNOWN: The mistake does not clearly fit any of the above categories.

For each mistake, provide:
- A clear, concise description of what went wrong (1-2 sentences).
- The academic topic or subject area (e.g. "Quadratic Equations", "Organic Chemistry – Aldehydes", "Electromagnetic Induction").
- A confidence score between 0 and 1 indicating how certain you are that this is indeed a mistake (1 = very certain, 0.5 = uncertain). Set to null if you cannot determine confidence.

If the text chunk does not contain any identifiable mistakes (e.g. it is blank, illegible, or contains only correct work), return an empty mistakes array.

Important:
- Only report actual mistakes, not correct answers.
- Do not fabricate mistakes if the text is unclear — use UNKNOWN type with low confidence instead.
- Be specific about what the student did wrong, not just that they got it wrong.`;

/**
 * Analyse a single text chunk from an OCR'd exam document and extract
 * any mistakes the student made. Returns structured mistake data.
 */
export async function analyseChunkForMistakes(
  chunk: ChunkAnalysisInput,
): Promise<AnalysedMistake[]> {
  const userPrompt = `Analyze the following OCR text from an exam answer sheet (pages ${chunk.pageStart}–${chunk.pageEnd}, chunk #${chunk.chunkIndex}).

Identify any mistakes the student made and classify each one.

--- OCR TEXT START ---
${chunk.text}
--- OCR TEXT END ---`;

  const { output } = await generateText({
    model: google(GOOGLE_MODEL),
    output: Output.object({
      schema: analysisResultSchema,
    }),
    system: SYSTEM_PROMPT,
    prompt: userPrompt,
    temperature: 0.2,
  });

  return output.mistakes;
}

/**
 * Analyse multiple chunks sequentially and return all discovered mistakes.
 * Chunks are processed one at a time to respect rate limits.
 */
export async function analyseAllChunksForMistakes(
  chunks: ChunkAnalysisInput[],
): Promise<AnalysedMistake[]> {
  const allMistakes: AnalysedMistake[] = [];

  for (const chunk of chunks) {
    if (!chunk.text.trim()) {
      continue;
    }

    const mistakes = await analyseChunkForMistakes(chunk);
    allMistakes.push(...mistakes);
  }

  return allMistakes;
}

/**
 * Analyse a document natively using the multimodal capabilities of the AI model.
 */
export async function analyseDocumentNatively(input: {
  buffer: Buffer;
  mimeType: string;
}): Promise<AnalysedMistake[]> {
  const userPrompt = `Analyze the attached exam answer sheet.
Identify any mistakes the student made and classify each one. If there are no mistakes, return an empty array.`;

  const { output } = await generateText({
    model: google(GOOGLE_MODEL),
    output: Output.object({
      schema: analysisResultSchema,
    }),
    system: SYSTEM_PROMPT,
    messages: [
      {
        role: "user",
        content: [
          { type: "text", text: userPrompt },
          { type: "image", image: input.buffer,},
        ],
      },
    ],
    temperature: 0.2,
  });

  return output.mistakes;
}
