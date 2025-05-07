import { tool } from 'ai';
import { z } from 'zod';

export const getCurrentDateTime = tool({
  description: "Gets the current date and time of the user",
  parameters: z.object({

  }),
  execute: async () => {
    const tz = 'Africa/Lagos';
    const now = new Date();
    return {
      date: now.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        timeZone: tz,
      }),
      time: now.toLocaleTimeString('en-US', {
        timeZone: tz,
      }),
      iso: now.toISOString(),
    };
  },
});

export const CURRENT_DATE_TIME_TOOL = {
    id: "DATETIME_TOOL",
    tool: getCurrentDateTime,
}