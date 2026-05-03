
import { createGoogleGenerativeAI } from "@ai-sdk/google";

export const google = createGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_AI_API_KEY as string,
});

export const GOOGLE_MODEL = "gemini-3.1-pro";

