import { verifyTableAccess } from "./verify";
import { getUserToolConfig, getUserUid } from "../../ai";
import { goals_db } from "../../init";
import { parseTime } from  "../utils";
import { Query, CollectionReference } from 'firebase-admin/firestore';

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

// Main function broken down into smaller, more focused functions
export const readTableRecord = async (params: {
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
    
    // Initialize and validate
    const { tableId, tableData } = await initializeAndValidate(params);
    
    try {
        // If recordId is specified, get that specific record
        if (params.recordId) {
            return await getRecordById(tableId, params.recordId);
        }

        // Build query with server-side filters where possible
        const { query, serverFilters, clientFilters } = buildFilteredQuery(tableId, tableData, params);

        console.log('query', query);
        console.log('serverFilters', serverFilters);
        console.log('clientFilters', clientFilters);
        // Execute the query
        const recordsSnapshot = await query.get();
        let records = recordsSnapshot.docs.map(doc => doc.data());

        // Apply client-side filters
        if (clientFilters.length > 0) {
            records = applyClientFilters(records, clientFilters, tableData);
        }

        // Apply limit if needed
        records = applyLimit(records, params.limit, serverFilters.length === 0);

        // Return formatted result
        const result = {
            success: true,
            message: `Found ${records.length} records`,
            records: records
        };

        console.log(result);
        return result;
    } catch (error) {
        console.error('Error reading table records:', error);
        throw new Error(`Failed to read records: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
};

// Initialize and validate inputs
const initializeAndValidate = async (params: any) => {
    const uid = getUserUid();
    const toolConfig = getUserToolConfig() || {};

    // Get the table ID from the params or from the tool config
    const tableId = toolConfig?.TABLE?.selected_table_id || params.tableId;

    if (!tableId) {
        throw new Error('Table ID is required. Please configure the Table tool with a selected table.');
    }

    // Verify access to the table
    const { exists, tableData } = await verifyTableAccess(uid, tableId);

    if (!exists) throw new Error('Table not found or access denied');
    
    return { tableId, tableData };
};

// Get a specific record by ID
const getRecordById = async (tableId: string, recordId: string) => {
    const recordDoc = await goals_db.collection('tables').doc(tableId).collection('records').doc(recordId).get();

    if (!recordDoc.exists) {
        return {
            success: false,
            message: 'Record not found',
            records: []
        };
    }

    return {
        success: true,
        message: 'Record found',
        records: [recordDoc.data()]
    };
};

// Build query with server-side filters
const buildFilteredQuery = (tableId: string, tableData: any, params: any) => {
    // Start with basic query
    let query: CollectionReference | Query = goals_db.collection('tables').doc(tableId).collection('records');
    
    // Initialize filter arrays
    const serverFilters: { field: string; operator: string; value: any }[] = [];
    const clientFilters: { field: string; operator: string; value: any }[] = [];
    
    // Apply filters if provided
    if (params.filter && params.filter.length > 0) {
        for (const filterItem of params.filter) {
            // Find the field definition
            const field = tableData.fields.find((f: any) => 
                f.name.toLowerCase() === filterItem.field.toLowerCase()
            );
            
            // Skip if field doesn't exist
            if (!field) continue;
            
            const fieldType = field.type || 'text';
            
            // Handle date filters with Firebase query
            if (fieldType === 'date') {
                const filterValue = convertToDate(filterItem.value);
                if (filterValue !== null) {
                    const fieldPath = field.id;
                    
                    switch(filterItem.operator) {
                        case 'equals':
                            const startOfDay = new Date(filterValue);
                            startOfDay.setHours(0, 0, 0, 0);
                            
                            const endOfDay = new Date(filterValue);
                            endOfDay.setHours(23, 59, 59, 999);
                            
                            query = query.where(fieldPath, '>=', startOfDay)
                                       .where(fieldPath, '<=', endOfDay);
                            break;
                            
                        case 'greater_than':
                            query = query.where(fieldPath, '>', filterValue);
                            break;
                            
                        case 'less_than':
                            query = query.where(fieldPath, '<', filterValue);
                            break;
                            
                        default:
                            clientFilters.push(filterItem);
                            break;
                    }
                    
                    serverFilters.push(filterItem);
                } else {
                    clientFilters.push(filterItem);
                }
            } else {
                clientFilters.push(filterItem);
            }
        }
    }

    // Apply limit to the query if provided
    if (params.limit && params.limit > 0) {
        query = query.limit(params.limit);
    }

    return { query, serverFilters, clientFilters };
};

// Apply client-side filters
const applyClientFilters = (records: any[], filters: any[], tableData: any) => {
    return records.filter(record => {
        return filters.every(filterItem => {
            // Find field definition
            const field = tableData.fields.find((f: any) =>
                f.name.toLowerCase() === filterItem.field.toLowerCase()
            );
            
            if (!field) return false;
            
            // Get field value
            const fieldValue = record[field.id];
            const fieldType = field.type || 'text';
            
            if (fieldValue === undefined) return false;
            
            // Convert values for comparison
            return compareValues(fieldValue, filterItem.value, fieldType, filterItem.operator);
        });
    });
};

// Compare values based on type and operator
const compareValues = (fieldValue: any, filterValue: any, fieldType: string, operator: string) => {
    let compareValue: any = fieldValue;
    let filterVal: any = filterValue;
    
    // Type conversion based on field type
    switch (fieldType) {
        case 'number':
            compareValue = convertToNumber(fieldValue);
            filterVal = convertToNumber(filterValue);
            if (compareValue === null || filterVal === null) return false;
            break;
            
        case 'date':
            compareValue = convertToDate(fieldValue);
            filterVal = convertToDate(filterValue);
            if (compareValue === null || filterVal === null) return false;
            break;
            
        case 'time':
            compareValue = convertToTime(fieldValue);
            filterVal = convertToTime(filterValue);
            if (compareValue === null || filterVal === null) return false;
            
            if (compareValue instanceof Date && filterVal instanceof Date) {
                const baseDate = new Date(0);
                const compareTimeOnly = new Date(
                    baseDate.setHours(
                        compareValue.getHours(),
                        compareValue.getMinutes(),
                        compareValue.getSeconds()
                    )
                );
                const filterTimeOnly = new Date(
                    baseDate.setHours(
                        filterVal.getHours(),
                        filterVal.getMinutes(),
                        filterVal.getSeconds()
                    )
                );
                compareValue = compareTimeOnly.getTime();
                filterVal = filterTimeOnly.getTime();
            }
            break;
            
        default:
            compareValue = String(compareValue);
            filterVal = String(filterValue);
    }
    
    // Apply the operator
    switch (operator) {
        case 'equals':
            if (fieldType === 'date') {
                return (compareValue as Date).getTime() === (filterVal as Date).getTime();
            }
            if (typeof compareValue === 'string' && typeof filterVal === 'string') {
                return compareValue.toLowerCase() === filterVal.toLowerCase();
            }
            return compareValue === filterVal;
            
        case 'contains':
            return String(compareValue).toLowerCase().includes(String(filterVal).toLowerCase());
            
        case 'greater_than':
            if (fieldType === 'date') {
                return (compareValue as Date).getTime() > (filterVal as Date).getTime();
            }
            if ((fieldType === 'number' || fieldType === 'time') && 
                compareValue !== null && filterVal !== null) {
                return compareValue > filterVal;
            }
            return false;
            
        case 'less_than':
            if (fieldType === 'date') {
                return (compareValue as Date).getTime() < (filterVal as Date).getTime();
            }
            if ((fieldType === 'number' || fieldType === 'time') && 
                compareValue !== null && filterVal !== null) {
                return compareValue < filterVal;
            }
            return false;
            
        case 'starts_with':
            return String(compareValue).toLowerCase().startsWith(String(filterVal).toLowerCase());
            
        case 'ends_with':
            return String(compareValue).toLowerCase().endsWith(String(filterVal).toLowerCase());
            
        default:
            return false;
    }
};

// Apply limit to results if needed
const applyLimit = (records: any[], limit: number | undefined, applyClientSide: boolean) => {
    if (limit && limit > 0 && applyClientSide && records.length > limit) {
        return records.slice(0, limit);
    }
    return records;
};
