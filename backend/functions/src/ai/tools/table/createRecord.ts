import { tool } from 'ai';
import {  z } from 'zod';
import { createTableRecord } from "../../../toolCalls/table/createRecord";



const createTableRecordTool = tool({
    description: "Add / log a new record to a table. Field values must match their defined types or the operation will fail.",
    parameters: z.object({
        record: z.any().describe("The record data to add (field values) as a JSON object. Values must match their field types (text, number, date, time, boolean, select, email, url, textarea). Type validation is enforced."),
    }),
    execute: async (input:any) => {
        try {
            const result = await createTableRecord(input);
            return result;
        } catch (error) {
            console.error('Error in createTableRecordTool:', error);
            throw new Error(`Failed to create record: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
});

export const TABLE_CREATE = {
    id: "TABLE_CREATE",
    tool: createTableRecordTool
};
