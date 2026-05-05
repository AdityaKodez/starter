import { createTRPCContext } from "@/trpc/init";
import { createCaller } from "@/trpc/routers/_app";
import { google } from "@ai-sdk/google";
import { convertToModelMessages, stepCountIs, streamText, tool } from "ai";
import { z } from "zod";

export async function POST(req: Request) {
  let { messages } = await req.json();
  messages = await convertToModelMessages(messages);
  const result = streamText({
    model: google("gemini-3.1-flash-lite-preview"),
    messages,
    stopWhen: stepCountIs(5),
    system: `You are an expert JEE mentor. Ask the user one question at a time to collect their exam year, attempt number, daily study minutes, coaching start/end times, rank aim, and weakest subject. When asking for daily study minutes, you MUST use the 'askDailyStudyMinute' tool instead of asking as plain text. Once you have all the information, call the 'completeOnboarding' tool. IMPORTANT do not use it for each query, use it only when you have all the context required`,
    tools: {
      askDailyStudyMinute: tool({
        description: "Ask the user for their daily study minutes using a specialized UI component.",
        inputSchema: z.object({}),
      }),
      completeOnboarding: tool({
        description:
          "Saves the user's collected onboarding data to the database.IMPORTANT do not use it for each query, use it only when you have all the context required",
        inputSchema: z.object({
          examYear: z.number().int().min(2024),
          attemptNumber: z.number().int().optional().nullable(),
          dailyStudyMinutes: z.number().optional().nullable(),
          coachingStart: z.number().int().optional().nullable(),
          rankAim: z.number().int().optional().nullable(),
          coachingEnd: z.number().int().optional().nullable(),
          weakestSubject: z
            .enum(["physics", "chemistry", "maths", "english", "cs"])
            .optional()
            .nullable(),
        }),
        execute: async (data) => {
          const caller = createCaller(await createTRPCContext());
          const onboarding = await caller.onboarding.complete(data);
          if (!onboarding.success)
            throw new Error("Onboarding failed: Please try again later");
          return { success: true, message: "Onboarding complete!" };
        },
      }),
    },
  });

  return result.toUIMessageStreamResponse();
}
