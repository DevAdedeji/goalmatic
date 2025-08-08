import { WorkflowContext } from "@upstash/workflow";
import { FlowNode } from "../../../type";
import { goals_db } from "../../../../../init";

const updateRecord = async (context: WorkflowContext, step: FlowNode, previousStepResult: any) => {


    try {
        // Extract user ID from the flow data
        const { userId } = context.requestPayload as { userId: string };
        if (!userId) {
            throw new Error('User ID not found in flow data');
        }

        // Extract parameters from props
        const {
            tableId,
            recordId,
            recordData
        } = step.propsData;

        if (!tableId) {
            return {
                success: false,
                error: 'Table ID is required'
            };
        }

        if (!recordId) {
            return {
                success: false,
                error: 'Record ID is required'
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
        let updatedFields;
        try {
            updatedFields = typeof recordData === 'string' ? JSON.parse(recordData) : recordData;
        } catch (error) {
            return {
                success: false,
                error: 'Invalid record data format. Must be a valid JSON object.'
            };
        }

        // Get the record from the subcollection
        const recordDoc = await goals_db.collection('tables').doc(tableId).collection('records').doc(recordId).get();

        if (!recordDoc.exists) {
            return {
                success: false,
                error: 'Record not found'
            };
        }

        // Get the existing record
        const existingRecord = recordDoc.data();

        // Create the updated record
        const updatedRecord = {
            ...existingRecord,
            ...updatedFields,
            id: recordId, // Ensure ID doesn't change
            updated_at: new Date() // Update the updated_at timestamp
        };

        // Validate the record against the table fields and enforce uniqueness
        const fields = tableData.fields || [];
        for (const field of fields) {
            if (field.required && (updatedRecord[field.id] === undefined || updatedRecord[field.id] === null || updatedRecord[field.id] === '')) {
                return {
                    success: false,
                    error: `Required field '${field.name}' is missing`
                };
            }

            // Prevent duplicates when configured, ignoring the current record
            const newValue = updatedRecord[field.id];
            if (field.preventDuplicates && newValue !== undefined && newValue !== null && newValue !== '') {
                const dupSnap = await goals_db
                    .collection('tables')
                    .doc(tableId)
                    .collection('records')
                    .where(field.id, '==', newValue)
                    .limit(1)
                    .get();
                if (!dupSnap.empty) {
                    const dupDoc = dupSnap.docs[0];
                    if (dupDoc.id !== recordId) {
                        return {
                            success: false,
                            error: `Value for '${field.name}' must be unique. '${newValue}' already exists.`,
                        };
                    }
                }
            }
        }

        // Update the record in the subcollection
        await goals_db.collection('tables').doc(tableId).collection('records').doc(recordId).update(updatedRecord);

        // Update the table's updated_at timestamp
        await goals_db.collection('tables').doc(tableId).update({
            updated_at: new Date()
        });

        return {
            success: true,
            message: 'Record updated successfully',
            record: updatedRecord,
        };
    } catch (error: any) {
        console.error('Error in updateRecord node:', error);
        return {
            success: false,
            error: error?.message || error,
        };
    }
};

export const updateRecordNode = {
    nodeId: 'TABLE_UPDATE',
    run: updateRecord
};
