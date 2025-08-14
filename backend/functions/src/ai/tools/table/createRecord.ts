import { tool } from 'ai';
import { z } from 'zod';
import { createTableRecord } from "../../../toolCalls/table/createRecord";



const createTableRecordTool = tool({
    description: "Add / log a new record to a table. If a table is selected in toolsConfig.TABLE.selected_table_id, use that table's field IDs as keys. Values must match their field types (text, number, date, time, boolean, select, email, url, textarea). For select fields, choose one of the allowed options exactly as listed in <SelectedTable>.",
    parameters: z.object({
        record: z.any().describe("The record data to add (field values) as a JSON object. Prefer table field IDs as keys. If date/time fields are required and not provided by the user, call the datetime tool first."),
    }),
    execute: async (input: any) => {
        try {
            const result = await createTableRecord(input);
            return result;
        } catch (error) {
            throw new Error(`Failed to create record: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
});

export const TABLE_CREATE = {
    id: "TABLE_CREATE",
    tool: createTableRecordTool
};
