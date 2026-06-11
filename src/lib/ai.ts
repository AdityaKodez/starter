
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { SarvamAIClient } from "sarvamai";
import { env } from "process"
export const sarvam = new SarvamAIClient({
    apiSubscriptionKey: env.SARVAM_API_KEY as string  ,
});

export const google = createGoogleGenerativeAI({
  apiKey: env.GOOGLE_AI_API_KEY as string,
});

export const GOOGLE_MODEL = "gemini-3.1-flash-lite";
