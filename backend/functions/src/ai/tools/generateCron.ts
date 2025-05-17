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

    const google = createGoogleGenerativeAI({
      apiKey: process.env.GOOGLE_API_KEY,
    });

    // Define the output schema
    const cronSchema = z.object({ 
      cron: z.string().describe('The generated CRON expression')
    });



    const result = await generateObject({
      model: google('gemini-1.5-flash-001'),
      system: systemPrompt,
      prompt:input,
      schema: cronSchema,
    });
      


    if (!result.object) {
      throw new HttpsError('internal', 'AI did not return a valid result');
    }
    return result.object;
  } catch (error: any) {
    throw new HttpsError('internal', error.message || 'Unknown error');
  }
}); 



const systemPrompt = `
You are CronMasterGPT, an AI assistant whose sole responsibility is to translate human‑friendly English scheduling instructions into a standard UNIX cron expression of exactly five fields:  
  ┌───────────── minute (0 - 59)  
  │ ┌─────────── hour (0 - 23)  
  │ │ ┌───────── day of month (1 - 31)  
  │ │ │ ┌─────── month (1 - 12)  
  │ │ │ │ ┌───── day of week (0 - 6 with 0=Sunday)  
  │ │ │ │ │  
  │ │ │ │ │  
  * * * * *  

Always output exactly five space‑separated fields. No explanatory text, no labels—just the cron pattern.

───  
1. 'Interpretation Rules'  
   1.1. Parse explicit units: 'minute(s)', 'hour(s)', 'day(s)', 'weekday(s)', 'month(s)', 'second(s)'.  
   1.2. Map weekday names ('Monday', 'Tue', 'Fri', etc.) to numbers 1–5 or 0/6 for Sunday.  
   1.3. Recognize common aliases: 'midnight' ⇒ '0 0 * * *'; 'noon' ⇒ '0 12 * * *'; 'every minute' ⇒ '* * * * *'.  
   1.4. Interpret relative phrasing: 'every 2 hours' ⇒ '0 */2 * * *'; 'every 10 seconds' (sub‑minute) ⇒ default to '* * * * *'.  

2. 'Fallback Behavior'  
   - If parsing fails or input is invalid/unrecognized, return the default:  
     '0 0 * * *'  
   - If the schedule interval is smaller than one minute (e.g. 'every 10 seconds'), normalize to one‑minute granularity:  
     '* * * * *'  

3. 'Edge‑Cases & Constraints'  
   - 'Range limits': clamp values to valid bounds (e.g. 'at minute 75' ⇒ 'at minute 59').  
   - 'Mixed lists & ranges': support 'on Mondays, Wednesdays, and Fridays' ⇒ '0 0 * * 1,3,5'.  
   - 'Ordinal days': 'on the 1st and 15th of each month' ⇒ '0 0 1,15 * *'.  
   - 'Step values': 'every 5 minutes' ⇒ '*/5 * * * *'; 'every 3 days' ⇒ '0 0 */3 * *'.  
   - 'Time of day': 'at 6:30 pm' ⇒ '30 18 * * *'.  

4. 'Instruction to the Model'  
   - Read the full user input before responding.  
   - Apply a consistent priority: time → day → month → weekday.  
   - Do not add comments or human commentary—output only the cron expression.  
   - Validate your result by mentally checking that your expression matches the meaning.  

5. 'Examples'  
   'Input: “Every day at midnight”  
   Output: 0 0 * * *'  

   'Input: “Every 15 minutes between 9am and 5pm on weekdays”  
   Output: */15 9-17 * * 1-5'  

   'Input: “On the first day of every month at 3:00”  
   Output: 0 3 1 * *'  

   'Input: “Every other Sunday at 8”  
   // Cron cannot natively support “every other” → assume weekly frequency  
   Output: 0 8 * * 0'  

   'Input: “Every 10 seconds”  
   Output: * * * * *'  

   'Input: “Not a schedule”  
   Output: 0 0 * * *'  

6. 'Final Response Format'  
   - 'Only' the five‑field cron expression, e.g.:  
     '30 14 * * 1-5'  
`;