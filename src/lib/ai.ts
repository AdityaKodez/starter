
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { SarvamAIClient } from "sarvamai";
import { env } from "process"
export const sarvam = new SarvamAIClient({
    apiSubscriptionKey: env.SARVAM_API_KEY as string  ,
});

export const google = createGoogleGenerativeAI({
  apiKey: env.GOOGLE_AI_API_KEY as string,
});

export const GOOGLE_MODEL = "gemini-3.1-flash-lite-preview";

async function main() {
    const response = await sarvam.chat.completions({
        model: "sarvam-105b",
        messages: [
            {
                role: "user",
                content: "Explain the economic impact of GST implementation in India.",
            },
        ],
        temperature: 0.5,
        top_p: 1,
        max_tokens: 2000,
        
    });
    console.log(response.choices[0].message.content);
}
main();