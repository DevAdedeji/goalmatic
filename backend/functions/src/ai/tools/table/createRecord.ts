import { verifyTableAccess } from "./verify";
import { getUserUid, getUserToolConfig } from "../../index";
import { tool } from 'ai';
import {  z } from 'zod';
import { goals_db } from '../../../init';
import { v4 as uuidv4 } from 'uuid';
import { formatDate, formatTime, dateStringToTimestamp } from '../utils/dateTimeFormatters';
import { Timestamp } from 'firebase-admin/firestore';

const createTableRecord = async (params: {
    tableId?: string;
    record: Record<string, any>;
}) => {
    console.log('params', params);
    const uid = getUserUid();
    const toolConfig = getUserToolConfig() || {};

    // Get the table ID from the params or from the tool config
    const tableId = params.tableId || toolConfig?.TABLE?.selected_table_id;

    if (!tableId) {
        throw new Error('Table ID is required. Please configure the Table tool with a selected table.');
    }

    // Verify access to the table
    const { exists, tableData } = await verifyTableAccess(uid, tableId);
    if (!exists) throw new Error('Table not found or access denied');

    try {
        // Generate a new ID for the record
        const recordId = uuidv4();
        const now = Timestamp.now();

        // Create the new record with timestamps
        const newRecord = {
            id: recordId,
            created_at: now,
            updated_at: now
        };

        // Validate the record against the table fields
        const fields = tableData.fields || [];

        for (const field of fields) {
            // Find the field in the record object, accounting for case differences
            let fieldValue: any = undefined;
            const fieldNameLower = field.name.toLowerCase();

            // First check for exact match by name or id
            if (params.record[field.name] !== undefined) {
                fieldValue = params.record[field.name];
            } else if (params.record[field.id] !== undefined) {
                fieldValue = params.record[field.id];
            } else {
                // Then check for case-insensitive match by name
                const caseInsensitiveKey = Object.keys(params.record).find(
                    key => key.toLowerCase() === fieldNameLower
                );

                if (caseInsensitiveKey) {
                    fieldValue = params.record[caseInsensitiveKey];
                }
            }

            // Format date and time fields before validation and saving
            if (fieldValue !== undefined && fieldValue !== null && fieldValue !== '') {
                 if (field.type === 'date') {
                    // Convert date strings to Firebase Timestamp objects
                    if (typeof fieldValue === 'string') {
                        try {
                            // First try to parse as a date string (YYYY-MM-DD)
                            const dateObj = new Date(fieldValue);
                            if (!isNaN(dateObj.getTime())) {
                                // Valid date, convert to Timestamp
                                fieldValue = Timestamp.fromDate(dateObj);
                            } else {
                                // If not a valid date string, try to format it
                                const formattedDate = formatDate(fieldValue);
                                if (formattedDate !== null) {
                                    // Create a Date from the formatted string and convert to Timestamp
                                    const dateFromFormatted = new Date(formattedDate);
                                    fieldValue = Timestamp.fromDate(dateFromFormatted);
                                } else {
                                    console.warn(`Skipping invalid date format for field '${field.name}': ${fieldValue}`);
                                }
                            }
                        } catch (e) {
                            console.warn(`Error converting date to Timestamp for field '${field.name}': ${e}`);
                        }
                    } else if (fieldValue instanceof Date) {
                        // If it's already a Date object, convert to Timestamp
                        fieldValue = Timestamp.fromDate(fieldValue);
                    }
                    // If it's already a Timestamp, leave it as is
                } else if (field.type === 'time') {
                    const formattedTime = formatTime(fieldValue);
                     if (formattedTime !== null) {
                        fieldValue = formattedTime;
                    } else {
                        // Handle invalid time format
                        console.warn(`Skipping invalid time format for field '${field.name}': ${fieldValue}`);
                        // Optionally clear the value or throw an error
                        // fieldValue = undefined;
                        // throw new Error(`Invalid time format for field '${field.name}': ${fieldValue}`);
                    }
                }
            }

            if (field.required && (fieldValue === undefined || fieldValue === null || fieldValue === '')) {
                throw new Error(`Required field '${field.name}' is missing or invalid`); // Updated error message slightly
            }

            // Map the potentially formatted field value to the correct ID in the new record
            if (fieldValue !== undefined && newRecord[field.id] === undefined) {
                newRecord[field.id] = fieldValue;
            }
        }

        // Add the record to the records subcollection
        await goals_db.collection('tables').doc(tableId).collection('records').doc(recordId).set(newRecord);

        // Update the table's updated_at timestamp
        await goals_db.collection('tables').doc(tableId).update({
            updated_at: Timestamp.now()
        });

        return {
            success: true,
            message: 'Record created successfully',
            record: newRecord
        };
    } catch (error) {
        console.error('Error creating table record:', error);
        throw new Error(`Failed to create record: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
};

const createTableRecordTool = tool({
    description: "Add / log a new record to a table",
    parameters: z.object({
        record: z.any().describe("The record data to add (field values) as a JSON object. Supports text, number, date, time, boolean, select, email, url, and textarea fields."),
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
