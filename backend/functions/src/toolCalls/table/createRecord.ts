import { v4 as uuidv4 } from 'uuid';
import { Timestamp } from 'firebase-admin/firestore';
import { goals_db } from "../../init";
import { getUserToolConfig, getUserUid } from "../../ai";
import { parseTime, formatDate, formatTime } from "../utils";
import { verifyTableAccess } from './verify';
import { Timestamp as AdminTimestamp } from 'firebase-admin/firestore';
const normalizeUnique = (val: any): string => {
    if (val === undefined || val === null) return '';
    return String(val)
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
};

const buildUniqueDocId = (fieldId: string, normalized: string) => `${fieldId}::${normalized}`;


// Normalizes field names so variations like "Activity Name", "activity_name",
// "activity-name" or "activityName" can be matched consistently
const normalizeFieldName = (val: any): string => {
    if (val === undefined || val === null) return '';
    return String(val)
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '');
};

// Tokenize a field name into meaningful words (e.g., "activity_name" -> ["activity", "name"]) for synonym-ish matching
const tokenizeFieldName = (val: any): string[] => {
    if (val === undefined || val === null) return [];
    return String(val)
        .toLowerCase()
        .split(/[^a-z0-9]+/)
        .filter(Boolean);
};




/**
 * Validates if a value matches the expected field type
 * @param value The value to validate
 * @param fieldType The expected field type
 * @param fieldName The name of the field (for error messages)
 * @param field The complete field object (optional, used for select validation)
 * @returns An object with validation result and error message if applicable
 */
function validateFieldType(value: any, fieldType: string, fieldName: string, field?: any): { valid: boolean; message?: string } {
    if (value === undefined || value === null || value === '') {
        return { valid: true };
    }
    switch (fieldType) {
        case 'text':
        case 'textarea':
            // Text fields can accept any value that can be converted to a string
            return { valid: true };

        case 'number':
            // For number fields, check if the value is a number or can be converted to one
            if (typeof value === 'number') {
                return { valid: true };
            }

            const num = Number(value);
            if (isNaN(num)) {
                return {
                    valid: false,
                    message: `Field '${fieldName}' must be a number, received: ${typeof value} (${value})`
                };
            }
            return { valid: true };

        case 'boolean':
            // For boolean fields, check if the value is a boolean or can be converted to one
            if (typeof value === 'boolean') {
                return { valid: true };
            }

            if (typeof value === 'string') {
                const lowercaseValue = value.toLowerCase();
                if (['true', 'false', '1', '0', 'yes', 'no'].includes(lowercaseValue)) {
                    return { valid: true };
                }
            }

            if (typeof value === 'number' && (value === 0 || value === 1)) {
                return { valid: true };
            }

            return {
                valid: false,
                message: `Field '${fieldName}' must be a boolean, received: ${typeof value} (${value})`
            };

        case 'date':
            // For date fields, check if the value is a valid date
            if (value instanceof Date && !isNaN(value.getTime())) {
                return { valid: true };
            }

            if (typeof value === 'object' && 'toDate' in value && typeof value.toDate === 'function') {
                // It's a Firebase Timestamp
                return { valid: true };
            }

            if (typeof value === 'string') {
                const dateObj = new Date(value);
                if (!isNaN(dateObj.getTime())) {
                    return { valid: true };
                }

                // Try with formatDate helper
                const formattedDate = formatDate(value);
                if (formattedDate !== null) {
                    return { valid: true };
                }
            }

            return {
                valid: false,
                message: `Field '${fieldName}' must be a valid date, received: ${typeof value} (${value})`
            };

        case 'time':
            // For time fields, check if the value is a valid time string
            if (typeof value === 'string') {
                const parsedTime = parseTime(value);
                if (parsedTime !== null) {
                    return { valid: true };
                }

                // Try with formatTime helper
                const formattedTime = formatTime(value);
                if (formattedTime !== null) {
                    return { valid: true };
                }
            }

            if (value instanceof Date && !isNaN(value.getTime())) {
                return { valid: true };
            }

            return {
                valid: false,
                message: `Field '${fieldName}' must be a valid time, received: ${typeof value} (${value})`
            };

        case 'email':
            // For email fields, check if the value is a valid email address
            if (typeof value !== 'string') {
                return {
                    valid: false,
                    message: `Field '${fieldName}' must be a string, received: ${typeof value}`
                };
            }

            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(value)) {
                return {
                    valid: false,
                    message: `Field '${fieldName}' must be a valid email address, received: ${value}`
                };
            }

            return { valid: true };

        case 'url':
            // For URL fields, check if the value is a valid URL
            if (typeof value !== 'string') {
                return {
                    valid: false,
                    message: `Field '${fieldName}' must be a string, received: ${typeof value}`
                };
            }

            try {
                new URL(value);
                return { valid: true };
            } catch (e) {
                return {
                    valid: false,
                    message: `Field '${fieldName}' must be a valid URL, received: ${value}`
                };
            }

        case 'select':
            // For select fields, check if it's a string and if options are provided, validate against them
            if (typeof value !== 'string') {
                return {
                    valid: false,
                    message: `Field '${fieldName}' must be a string, received: ${typeof value}`
                };
            }

            // If the field has options defined, validate that the value is one of the options
            if (field && Array.isArray(field.options) && field.options.length > 0) {
                const normalizedOptions = field.options.map((opt: string) => typeof opt === 'string' ? opt.toLowerCase() : '');
                const normalizedValue = value.toLowerCase();

                if (!normalizedOptions.includes(normalizedValue)) {
                    return {
                        valid: false,
                        message: `Field '${fieldName}' must be one of the allowed options: ${field.options.join(', ')}. Received: ${value}`
                    };
                }
            }

            return { valid: true };

        default:
            // For unknown field types, accept any value
            return { valid: true };
    }
}

export const createTableRecord = async (params: {
    tableId?: string;
    record: Record<string, any>;
}) => {

    console.log(params, 'params');

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

        // Resolve input record shape (support record, data, or top-level keys)
        const rawInput: any = (params && typeof params === 'object') ? (params as any) : {};
        const rawRecordCandidate: any = (rawInput.record && typeof rawInput.record === 'object')
            ? rawInput.record
            : (rawInput.data && typeof rawInput.data === 'object')
                ? rawInput.data
                : rawInput;
        const reservedKeys = new Set(['tableId', 'record', 'data']);
        const inputRecord: Record<string, any> = Object.fromEntries(
            Object.entries(rawRecordCandidate || {}).filter(([k]) => !reservedKeys.has(k))
        );

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
            if (inputRecord[field.name] !== undefined) {
                fieldValue = inputRecord[field.name];
            } else if (inputRecord[field.id] !== undefined) {
                fieldValue = inputRecord[field.id];
            } else {
                // Then check for case-insensitive match by name
                const caseInsensitiveKey = Object.keys(inputRecord).find(
                    key => key.toLowerCase() === fieldNameLower
                );

                if (caseInsensitiveKey) {
                    fieldValue = inputRecord[caseInsensitiveKey];
                } else {
                    // Finally, check using normalized name matching (ignoring spaces, underscores, hyphens, casing)
                    const normalizedTarget = normalizeFieldName(field.name);
                    const normalizedMatchKey = Object.keys(inputRecord).find(
                        key => normalizeFieldName(key) === normalizedTarget
                    );

                    if (normalizedMatchKey) {
                        fieldValue = inputRecord[normalizedMatchKey];
                    } else {
                        // As a last-resort, match if any token of the field name exactly matches the normalized key
                        const tokens = new Set(tokenizeFieldName(field.name));
                        const tokenMatchKey = Object.keys(inputRecord).find(key => tokens.has(normalizeFieldName(key)));
                        if (tokenMatchKey) {
                            fieldValue = inputRecord[tokenMatchKey];
                        }
                    }
                }
            }

            // Validate field type before processing
            if (fieldValue !== undefined) {
                const typeValidation = validateFieldType(fieldValue, field.type, field.name, field);
                if (!typeValidation.valid) {
                    throw new Error(typeValidation.message);
                }
            }

            // Format date and time fields after validation
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
                                    // This should not happen due to prior validation, but just in case
                                    throw new Error(`Invalid date format for field '${field.name}': ${fieldValue}`);
                                }
                            }
                        } catch (e) {
                            throw new Error(`Error converting date to Timestamp for field '${field.name}': ${e instanceof Error ? e.message : String(e)}`);
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
                        // This should not happen due to prior validation, but just in case
                        throw new Error(`Invalid time format for field '${field.name}': ${fieldValue}`);
                    }
                } else if (field.type === 'number' && typeof fieldValue !== 'number') {
                    // Convert string numbers to actual numbers
                    fieldValue = Number(fieldValue);
                } else if (field.type === 'boolean' && typeof fieldValue !== 'boolean') {
                    // Convert string booleans to actual booleans
                    if (typeof fieldValue === 'string') {
                        const lowercaseValue = fieldValue.toLowerCase();
                        if (['true', 'yes', '1'].includes(lowercaseValue)) {
                            fieldValue = true;
                        } else if (['false', 'no', '0'].includes(lowercaseValue)) {
                            fieldValue = false;
                        }
                    } else if (typeof fieldValue === 'number') {
                        fieldValue = fieldValue === 1;
                    }
                }
            }

            if (field.required && (fieldValue === undefined || fieldValue === null || fieldValue === '')) {
                // Auto-fallbacks to prevent hard failures for common temporal field types
                if (field.type === 'date') {
                    fieldValue = Timestamp.now();
                } else if (field.type === 'time') {
                    const nowDate = new Date();
                    const formatted = formatTime(nowDate);
                    if (formatted !== null) fieldValue = formatted;
                }
            }

            if (field.required && (fieldValue === undefined || fieldValue === null || fieldValue === '')) {
                const providedKeys = Object.keys(inputRecord || {});
                // Build a small set of suggested key variants the caller could use
                const base = String(field.name);
                const suggestions = new Set<string>([
                    base,
                    base.toLowerCase(),
                    base.toUpperCase(),
                    base.replace(/[_\-\s]+/g, ' '),
                    base.replace(/[_\-\s]+/g, ''),
                    base.replace(/[_\-\s]+/g, '-'),
                    base.replace(/[_\-\s]+/g, '_'),
                ]);
                const message = `Required field '${field.name}' is missing or invalid. Provided keys: [${providedKeys.join(', ')}]. You can supply this field using any of these key formats: [${Array.from(suggestions).join(', ')}]`;
                throw new Error(message);
            }

            // Defer unique enforcement to transactional section below

            // Map the potentially formatted field value to the correct ID in the new record
            if (fieldValue !== undefined && newRecord[field.id] === undefined) {
                newRecord[field.id] = fieldValue;
            }
        }

        // Transaction: create record and unique index docs atomically
        const tableRef = goals_db.collection('tables').doc(tableId);
        const recordRef = tableRef.collection('records').doc(recordId);
        const uniqueCol = tableRef.collection('unique');
        await goals_db.runTransaction(async (tx) => {
            const fields = tableData.fields || [];
            for (const field of fields) {
                if (!field.preventDuplicates) continue;
                const value = newRecord[field.id];
                if (value !== undefined && value !== null && value !== '') {
                    const norm = normalizeUnique(value);
                    const uRef = uniqueCol.doc(buildUniqueDocId(field.id, norm));
                    const existing = await tx.get(uRef);
                    if (existing.exists) {
                        throw new Error(`Value for '${field.name}' must be unique. '${value}' already exists.`);
                    }
                    tx.set(uRef, {
                        fieldId: field.id,
                        value,
                        normalizedValue: norm,
                        recordId,
                        created_at: AdminTimestamp.now(),
                        creator_id: uid,
                    });
                }
            }
            tx.set(recordRef, newRecord);
            tx.update(tableRef, { updated_at: AdminTimestamp.now() });
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
