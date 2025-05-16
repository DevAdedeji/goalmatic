import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { generateObject } from 'ai';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { z } from 'zod';

/**
 * Firebase callable function to generate a CRON expression and plain text description from natural language input.
 * Expects { input: string }
 * Returns { cron: string, PlainText: string }
 */
export const generateCron = onCall({ cors: true, region: 'us-central1' }, async (request) => {
  try {
    if (!request.auth) {
      throw new HttpsError('unauthenticated', 'Unauthorized');
    }
    const { input } = request.data;
    if (!input || typeof input !== 'string') {
      throw new HttpsError('invalid-argument', 'Missing or invalid input');
    }
console.log(input);
    const google = createGoogleGenerativeAI({
      apiKey: process.env.GOOGLE_API_KEY,
    });

    // Define the output schema
    const cronSchema = z.object({
      cron: z.string().describe('The generated CRON expression'),
    //   PlainText: z.string().describe('A plain English description of the schedule'),
    });

    // Prompt the model
    const prompt = `Convert the following natural language schedule to a CRON expression and a plain English description. Respond ONLY as a JSON object with keys 'cron' and 'PlainText'.\n\nInput: ${input}`;
console.log(prompt);
    const result = await generateObject({
      model: google('gemini-1.5-flash-001'),
      prompt,
      schema: cronSchema,

    });
      
      console.log(result);

    if (!result.object) {
      throw new HttpsError('internal', 'AI did not return a valid result');
    }
    return result.object;
  } catch (error: any) {
    throw new HttpsError('internal', error.message || 'Unknown error');
  }
}); 