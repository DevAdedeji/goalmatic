import { WorkflowContext } from "@upstash/workflow";
import { FlowNode } from "../../../type";
import { goals_db } from "../../../../../init";
import { v4 as uuidv4 } from 'uuid';
import { Timestamp } from 'firebase-admin/firestore';

const createRecord = async (context: WorkflowContext, step: FlowNode, previousStepResult: any) => {
    console.log('previousStepResult', previousStepResult);
    console.log(step.name, step.propsData);

    try {
        // Extract user ID from the flow data
        const { userId } = context.requestPayload as { userId: string };
        if (!userId) {
            throw new Error('User ID not found in flow data');
        }


        const {
            tableId,
            recordData
        } = step.propsData;

        if (!tableId) {
            return {
                success: false,
                error: 'Table ID is required'
            };
        }

        if (!recordData) {
            return {
                success: false,
                error: 'Record data is required'
            };
        }

        // Get the table document
        const tableDoc = await goals_db.collection('tables').doc(tableId).get();
        if (!tableDoc.exists) {
            return {
                success: false,
                error: 'Table not found'
            };
        }

        const tableData = tableDoc.data();

        // Check if the table belongs to the user
        if (tableData?.creator_id !== userId) {
            return {
                success: false,
                error: 'Unauthorized access to table'
            };
        }

        // Parse the record data
        let record;
        try {
            record = typeof recordData === 'string' ? JSON.parse(recordData) : recordData;
        } catch (error) {
            return {
                success: false,
                error: 'Invalid record data format. Must be a valid JSON object.'
            };
        }

        // Generate a new ID for the record
        const recordId = uuidv4();
        const now = Timestamp.now();

        // Create the new record with timestamps
        const newRecord = {
            ...record,
            id: recordId,
            created_at: now,
            updated_at: now
        };

        // Validate the record against the table fields and convert date fields to Timestamp
        const fields = tableData.fields || [];
        for (const field of fields) {
            // Convert date fields to Firebase Timestamp
            if (field.type === 'date' && newRecord[field.id] !== undefined && newRecord[field.id] !== null && newRecord[field.id] !== '') {
                try {
                    if (typeof newRecord[field.id] === 'string') {
                        // Convert string date to Timestamp
                        const dateObj = new Date(newRecord[field.id]);
                        if (!isNaN(dateObj.getTime())) {
                            newRecord[field.id] = Timestamp.fromDate(dateObj);
                        }
                    } else if (newRecord[field.id] instanceof Date) {
                        // Convert Date object to Timestamp
                        newRecord[field.id] = Timestamp.fromDate(newRecord[field.id]);
                    }
                    // If it's already a Timestamp, leave it as is
                } catch (e) {
                    console.warn(`Error converting date to Timestamp for field '${field.name}': ${e}`);
                }
            }

            // Check required fields
            if (field.required && (newRecord[field.id] === undefined || newRecord[field.id] === null || newRecord[field.id] === '')) {
                return {
                    success: false,
                    error: `Required field '${field.name}' is missing`
                };
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
        console.error('Error in createRecord node:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error'
        };
    }
};

export const createRecordNode = {
    nodeId: 'TABLE_CREATE',
    run: createRecord
};
