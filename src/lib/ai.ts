
import { generateText, Output } from 'ai';
import { createGoogleGenerativeAI } from '@ai-sdk/google';

import { z } from "zod";
import { TRPCError } from '@trpc/server';

export const LessonSchema = z.object({
  title: z.string().describe("Lesson title"),
  summary: z.string().describe("Short explanation of the lesson"),
  videoIds: z.array(z.string()).describe("YouTube video IDs in this lesson"),
  order: z.number().describe("Order of lesson"),
});

export const CourseSchema = z.object({
  courseTitle: z.string(),
  description: z.string(),
  lessons: z.array(LessonSchema).describe("List of structured lessons"),
});

const google = createGoogleGenerativeAI({
 apiKey: process.env.GOOGLE_AI_API_KEY as string,
 
});

export const generateModules = async ({ playlistVideos } :{
    playlistVideos: { title: string ,  id: string }[];
}) => {
  try {
    const response = await  generateText({
        model:google("gemini-3.1-flash-lite-preview"),
     output:Output.object({
     schema: CourseSchema,
        }),
      prompt: `
  You are given a YouTube playlist.
  Group videos into logical lessons.
  Input:
  - List of video titles
  - Optional descriptions
  Output:
  - Structured lessons with grouped videos
  ${JSON.stringify(playlistVideos)}
  `,
    });
    return response.output;
}  catch (error) {
    console.error("Error generating modules:", error);
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Failed to generate modules. Please try again."
    });
  }
}
