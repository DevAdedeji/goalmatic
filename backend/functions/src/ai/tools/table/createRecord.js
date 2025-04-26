"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TABLE_CREATE = void 0;
const verify_1 = require("./verify");
const index_1 = require("../../index");
const ai_1 = require("ai");
const zod_1 = require("zod");
const init_1 = require("../../../init");
const uuid_1 = require("uuid");
// Helper function to format date values to YYYY-MM-DD
function formatDate(value) {
    try {
        const date = new Date(value);
        // Check if the date is valid
        if (isNaN(date.getTime())) {
            console.warn(`Invalid date value received, cannot format: ${value}`);
            // Return original value or null/throw error depending on desired strictness
            // Returning null here to avoid saving invalid formats, but allow processing to continue
            return null;
        }
        // Format as YYYY-MM-DD
        const year = date.getFullYear();
        // getMonth() is 0-indexed, so add 1
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const day = date.getDate().toString().padStart(2, '0');
        return `${year}-${month}-${day}`;
    }
    catch (e) {
        console.warn(`Error formatting date value ${value}:`, e);
        return null; // Return null on error
    }
}
/**
 * Parses a time string in "H:mm:ss AM/PM", "HH:mm:ss", or "HH:mm" format and returns a Date object with today's date.
 * Returns null if parsing fails or results in an invalid date.
 */
function parseTime(timeString) {
    // Updated regex to make seconds and AM/PM optional, and handle HH:mm format
    const parts = timeString.match(/^(\d{1,2}):(\d{1,2})(?::(\d{1,2}))?(?:\s*(AM|PM))?$/i);
    if (!parts) {
        return null;
    }
    let hours = parseInt(parts[1], 10);
    const minutes = parseInt(parts[2], 10);
    // Default seconds to 0 if not provided
    const seconds = parts[3] ? parseInt(parts[3], 10) : 0;
    const ampm = parts[4]; // AM/PM part, might be undefined
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const day = now.getDate();
    // Adjust hours based on AM/PM if present
    if (ampm !== undefined) {
        const upperAmpm = ampm.toUpperCase();
        if (upperAmpm === 'PM' && hours !== 12) {
            hours += 12;
        }
        else if (upperAmpm === 'AM' && hours === 12) { // Handle 12 AM
            hours = 0;
        }
        // No adjustment needed for 12 PM or other AM hours
    }
    // Note: If AM/PM is not present, we assume 24-hour format (e.g., 20:08)
    // Validate parsed components
    if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59 || seconds < 0 || seconds > 59) {
        return null; // Invalid time components
    }
    const resultDate = new Date(year, month, day, hours, minutes, seconds);
    // Final check if the constructed date is valid
    if (isNaN(resultDate.getTime())) {
        return null;
    }
    return resultDate;
}
/**
 * Formats a Date object, timestamp, or recognizable date/time string into "H:mm:ss AM/PM" format.
 * Returns null if the input cannot be converted to a valid Date.
 */
function formatTime(value) {
    try {
        let date;
        if (typeof value === 'string') {
            const parsedDate = parseTime(value);
            date = parsedDate !== null ? parsedDate : new Date(value);
        }
        else if (value instanceof Date) {
            date = value;
        }
        else if (typeof value === 'number') {
            date = new Date(value);
        }
        else {
            return null;
        }
        if (isNaN(date.getTime())) {
            return null;
        }
        let hours = date.getHours();
        const minutes = date.getMinutes();
        const seconds = date.getSeconds();
        const ampm = hours >= 12 ? 'PM' : 'AM';
        hours = hours % 12;
        hours = hours ? hours : 12;
        const minutesStr = minutes.toString().padStart(2, '0');
        const secondsStr = seconds.toString().padStart(2, '0');
        const hoursStr = hours.toString();
        return `${hoursStr}:${minutesStr}:${secondsStr} ${ampm}`;
    }
    catch (e) {
        return null;
    }
}
const createTableRecord = async (params) => {
    console.log('params', params);
    const uid = (0, index_1.getUserUid)();
    const toolConfig = (0, index_1.getUserToolConfig)() || {};
    // Get the table ID from the params or from the tool config
    const tableId = params.tableId || toolConfig?.TABLE?.selected_table_id;
    if (!tableId) {
        throw new Error('Table ID is required. Please configure the Table tool with a selected table.');
    }
    // Verify access to the table
    const { exists, tableData } = await (0, verify_1.verifyTableAccess)(uid, tableId);
    if (!exists)
        throw new Error('Table not found or access denied');
    try {
        // Get the current records array
        const records = [...(tableData.records || [])];
        // Generate a new ID for the record
        const recordId = (0, uuid_1.v4)();
        const now = new Date();
        // Create the new record with timestamps
        const newRecord = {
            ...params.record,
            id: recordId,
            created_at: now,
            updated_at: now
        };
        // Validate the record against the table fields
        const fields = tableData.fields || [];
        for (const field of fields) {
            // Find the field in the record object, accounting for case differences
            let fieldValue = undefined;
            const fieldNameLower = field.name.toLowerCase();
            // First check for exact match by name or id
            if (params.record[field.name] !== undefined) {
                fieldValue = params.record[field.name];
            }
            else if (params.record[field.id] !== undefined) {
                fieldValue = params.record[field.id];
            }
            else {
                // Then check for case-insensitive match by name
                const caseInsensitiveKey = Object.keys(params.record).find(key => key.toLowerCase() === fieldNameLower);
                if (caseInsensitiveKey) {
                    fieldValue = params.record[caseInsensitiveKey];
                }
            }
            // Format date and time fields before validation and saving
            if (fieldValue !== undefined && fieldValue !== null && fieldValue !== '') {
                if (field.type === 'date') {
                    const formattedDate = formatDate(fieldValue);
                    if (formattedDate !== null) {
                        fieldValue = formattedDate;
                    }
                    else {
                        // Handle invalid date format - potentially throw error or skip field
                        console.warn(`Skipping invalid date format for field '${field.name}': ${fieldValue}`);
                        // Optionally clear the value or throw an error based on requirements
                        // fieldValue = undefined; // Example: Clear the value
                        // throw new Error(`Invalid date format for field '${field.name}': ${fieldValue}`);
                    }
                }
                else if (field.type === 'time') {
                    const formattedTime = formatTime(fieldValue);
                    if (formattedTime !== null) {
                        fieldValue = formattedTime;
                    }
                    else {
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
        // Add the record to the array
        records.push(newRecord);
        // Update the table in Firestore
        await init_1.goals_db.collection('tables').doc(tableId).update({
            records: records,
            updated_at: now
        });
        return {
            success: true,
            message: 'Record created successfully',
            record: newRecord
        };
    }
    catch (error) {
        console.error('Error creating table record:', error);
        throw new Error(`Failed to create record: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
};
const createTableRecordTool = (0, ai_1.tool)({
    description: "Add / log a new record to a table",
    parameters: zod_1.z.object({
        record: zod_1.z.any().describe("The record data to add (field values) as a JSON object. Supports text, number, date, time, boolean, select, email, url, and textarea fields."),
    }),
    execute: async (input) => {
        try {
            const result = await createTableRecord(input);
            return result;
        }
        catch (error) {
            console.error('Error in createTableRecordTool:', error);
            throw new Error(`Failed to create record: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
});
exports.TABLE_CREATE = {
    id: "TABLE_CREATE",
    tool: createTableRecordTool
};
