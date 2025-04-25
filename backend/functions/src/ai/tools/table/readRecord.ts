import { verifyTableAccess } from "./verify";
import { getUserUid, getUserToolConfig } from "../../index";
import { tool } from 'ai';
import { z } from 'zod';

// Helper functions for type conversion
const convertToNumber = (value: any): number | null => {
    if (typeof value === 'number') return value;
    if (typeof value === 'string') {
        const parsed = parseFloat(value);
        return isNaN(parsed) ? null : parsed;
    }
    return null;
};

const convertToDate = (value: any): Date | null => {
    if (value instanceof Date) return value;
    if (typeof value === 'string' || typeof value === 'number') {
        const date = new Date(value);
        return isNaN(date.getTime()) ? null : date;
    }
    return null;
};

/**
 * Parses a time string in "H:mm:ss AM/PM", "HH:mm:ss", or "HH:mm" format and returns a Date object with today's date.
 * Returns null if parsing fails or results in an invalid date.
 * @private Used internally and exported for potential future use
 */
export function parseTime(timeString: string): Date | null {
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
    } else if (upperAmpm === 'AM' && hours === 12) { // Handle 12 AM
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
 * @private Exported for potential future use
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function formatTime(value: Date | number | string): string | null {
  try {
    let date: Date;

    if (typeof value === 'string') {
      const parsedDate = parseTime(value);
      date = parsedDate !== null ? parsedDate : new Date(value);
    } else if (value instanceof Date) {
      date = value;
    } else if (typeof value === 'number') {
      date = new Date(value);
    } else {
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

  } catch (e) {
    return null;
  }
}

const convertToTime = (value: any): Date | null => {
    // First try to parse the time string using our parseTime function
    if (typeof value === 'string') {
        const parsedTime = parseTime(value);
        if (parsedTime !== null) {
            return parsedTime;
        }

        // If parseTime fails, try to extract time from a date string
        const date = new Date(value);
        if (!isNaN(date.getTime())) {
            return date;
        }
    } else if (value instanceof Date) {
        return value;
    } else if (typeof value === 'number') {
        const date = new Date(value);
        if (!isNaN(date.getTime())) {
            return date;
        }
    }

    return null;
};

const readTableRecord = async (params: {
    tableId?: string;
    recordId?: string;
    filter?: {
        field: string;
        operator: 'equals' | 'contains' | 'greater_than' | 'less_than' | 'starts_with' | 'ends_with';
        value: any;
    }[];
    limit?: number;
}) => {
    console.log('params', params);
    const uid = getUserUid();
    const toolConfig = getUserToolConfig() || {};

    // Get the table ID from the params or from the tool config
    const tableId =  toolConfig?.TABLE?.selected_table_id || params.tableId;

    if (!tableId) {
        throw new Error('Table ID is required. Please configure the Table tool with a selected table.');
    }

    // Verify access to the table
    const { exists, tableData } = await verifyTableAccess(uid, tableId);

    if (!exists) throw new Error('Table not found or access denied');

    try {
        // Get the records array
        const records = [...(tableData.records || [])];

        // If recordId is specified, return just that record
        if (params.recordId) {
            const record = records.find(r => r.id === params.recordId);
            if (!record) {
                return {
                    success: false,
                    message: 'Record not found',
                    records: []
                };
            }
            return {
                success: true,
                message: 'Record found',
                records: [record]
            };
        }


        // Apply filters if provided
        let filteredRecords = records;
        if (params.filter && params.filter.length > 0) {
            filteredRecords = records.filter(record => {
                return params.filter!.every(filterItem => {
                    // Find the field definition using the provided field name (case-insensitive)
                    const field = tableData.fields.find((f: { name: string; id: string; type?: string }) =>
                        f.name.toLowerCase() === filterItem.field.toLowerCase()
                    );

                    // If the field name doesn't exist in the table definition, the filter fails
                    if (!field) return false;

                    // Get the field value from the record using the field's ID
                    const fieldValue = record[field.id];
                    const fieldType = field.type || 'text'; // Default field type
                    // If the record doesn't have a value for this field, the filter fails
                    if (fieldValue === undefined) return false;


                    // Convert values based on field type for proper comparison
                    let compareValue: any = fieldValue;
                    let filterValue: any = filterItem.value;

                    // Type conversion based on field type using switch statement
                    switch (fieldType) {
                        case 'number':
                            compareValue = convertToNumber(fieldValue);
                            filterValue = convertToNumber(filterItem.value);
                            // If either value couldn't be converted to a number, comparison fails
                            if (compareValue === null || filterValue === null) {
                                return false;
                            }
                            break; // Exit switch after handling 'number'

                        case 'date':
                            compareValue = convertToDate(fieldValue);
                            filterValue = convertToDate(filterItem.value);
                            // If either value couldn't be converted to a date, comparison fails
                            if (compareValue === null || filterValue === null) {
                                return false;
                            }
                            break; // Exit switch after handling 'date'

                        case 'time':
                            compareValue = convertToTime(fieldValue);
                            filterValue = convertToTime(filterItem.value);
                            console.log('compareValue', compareValue);
                            console.log('filterValue', filterValue);
                            // If either value couldn't be converted to a time, comparison fails
                            if (compareValue === null || filterValue === null) {
                                return false;
                            }
                            // Convert to timestamp for comparison
                            if (compareValue instanceof Date && filterValue instanceof Date) {
                                // Extract only the time part for comparison by setting the same date
                                const baseDate = new Date(0); // January 1, 1970
                                const compareTimeOnly = new Date(
                                    baseDate.setHours(
                                        compareValue.getHours(),
                                        compareValue.getMinutes(),
                                        compareValue.getSeconds()
                                    )
                                );
                                const filterTimeOnly = new Date(
                                    baseDate.setHours(
                                        filterValue.getHours(),
                                        filterValue.getMinutes(),
                                        filterValue.getSeconds()
                                    )
                                );
                                compareValue = compareTimeOnly.getTime();
                                filterValue = filterTimeOnly.getTime();
                            }
                            break; // Exit switch after handling 'time'

                        default: // Handles 'text' and any other types
                            compareValue = String(compareValue);
                            filterValue = String(filterItem.value);
                            // No break needed as it's the default case
                    }
                    // console.log('compareValue', compareValue);
                    // console.log('filterValue', filterValue);

                    // Apply the operator with proper type handling
                    switch (filterItem.operator) {
                        case 'equals':
                            if (fieldType === 'date') {
                                // Compare dates by their timestamp
                                return (compareValue as Date).getTime() === (filterValue as Date).getTime();
                            }
                            // Case-insensitive comparison for strings
                            if (typeof compareValue === 'string' && typeof filterValue === 'string') {
                                return compareValue.toLowerCase() === filterValue.toLowerCase();
                            }
                            return compareValue === filterValue;

                        case 'contains':
                            // contains only makes sense for string values
                            return String(compareValue).toLowerCase().includes(String(filterValue).toLowerCase());

                        case 'greater_than':
                            if (fieldType === 'date') {
                                return (compareValue as Date).getTime() > (filterValue as Date).getTime();
                            }
                            // For time and number fields, we've already converted to comparable values
                            if ((fieldType === 'number' || fieldType === 'time') && compareValue !== null && filterValue !== null) {
                                return compareValue > filterValue;
                            }
                            // For other types, greater_than might not be meaningful or consistent
                            return false;

                        case 'less_than':
                            if (fieldType === 'date') {
                                return (compareValue as Date).getTime() < (filterValue as Date).getTime();
                            }
                            // For time and number fields, we've already converted to comparable values
                            if ((fieldType === 'number' || fieldType === 'time') && compareValue !== null && filterValue !== null) {
                                return compareValue < filterValue;
                            }
                            // For other types, less_than might not be meaningful or consistent
                            return false;

                        case 'starts_with':
                            // starts_with only makes sense for string values
                            return String(compareValue).toLowerCase().startsWith(String(filterValue).toLowerCase());

                        case 'ends_with':
                            // ends_with only makes sense for string values
                            return String(compareValue).toLowerCase().endsWith(String(filterValue).toLowerCase());

                        default:
                            return false;
                    }
                });
            });
        }

        // Apply limit if provided
        if (params.limit && params.limit > 0 && filteredRecords.length > params.limit) {
            filteredRecords = filteredRecords.slice(0, params.limit);
        }

        const result = {
            success: true,
            message: `Found ${filteredRecords.length} records`,
            records: filteredRecords
        };

        console.log(result);
        return result;
    } catch (error) {
        console.error('Error reading table records:', error);
        throw new Error(`Failed to read records: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
};

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