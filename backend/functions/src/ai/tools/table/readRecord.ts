import { tool } from 'ai';
import { z } from 'zod';
import { readTableRecord } from "../../../toolCalls/table/readRecord";

const readTableRecordTool = tool({
    description: "Read records from a table with optional filtering based on field names.",
    parameters: z.object({
        filter: z.array(
            z.object({
                field: z.string().describe("The field NAME to filter on (case-insensitive)"),
                operator: z.enum(['equals', 'contains', 'greater_than', 'less_than', 'starts_with', 'ends_with'])
                    .describe("The comparison operator to use"),
                value: z.any().describe("The value to compare against")
            })
        ).optional().describe("Optional filters to apply to the records"),
        limit: z.number().optional().describe("Maximum number of records to return")
    }),
    execute: async (input: any) => {
        try {
            const result = await readTableRecord(input);
            return result;
        } catch (error) {
            console.error('Error in readTableRecordTool:', error);
            throw new Error(`Failed to read records: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
});

export const TABLE_READ = {
    id: "TABLE_READ",
    tool: readTableRecordTool
};
