import { tool, generateText } from 'ai';
import { z } from 'zod';
import { createGoogleGenerativeAI } from "@ai-sdk/google"

const google = createGoogleGenerativeAI({
    apiKey: process.env.GOOGLE_API_KEY,
})

export const search = tool({
  description: "Searches the internet for information",
  parameters: z.object({
    query: z.string(),
  }),
  execute: async ({ query }: { query: string }) => {
        const result = await generateText({
            model: google("gemini-2.5-flash", {useSearchGrounding: true}),
            maxSteps: 2,
            prompt: `Search the internet for the following query: ${query}`,
        });
      return result.text;
  },
});

export const SEARCH_TOOL = {
    id: "GOOGLESEARCH_TOOL",
    tool: search,
}