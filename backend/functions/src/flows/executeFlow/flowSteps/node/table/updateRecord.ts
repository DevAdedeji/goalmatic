import { WorkflowContext } from "@upstash/workflow";
import { FlowNode } from "../../../type";
import { goals_db } from "../../../../../init";
import { Timestamp } from 'firebase-admin/firestore';

const normalizeUnique = (val: any): string => {
    if (val === undefined || val === null) return '';
    return String(val)
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
};

const buildUniqueDocId = (fieldId: string, normalized: string) => `${fieldId}::${normalized}`;

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

        // Transaction: update record and maintain unique index docs
        const tableRef = goals_db.collection('tables').doc(tableId);
        const recordRef = tableRef.collection('records').doc(recordId);
        const uniqueCol = tableRef.collection('unique');
        await goals_db.runTransaction(async (tx) => {
            // Load existing record to compute old unique keys
            const existingSnap = await tx.get(recordRef);
            const existing = existingSnap.data() || {};
            const fields = tableData.fields || [];
            for (const field of fields) {
                if (!field.preventDuplicates) continue;
                const oldVal = existing[field.id];
                const newVal = updatedRecord[field.id];
                if (newVal === undefined || newVal === null || newVal === '') continue;
                const newNorm = normalizeUnique(newVal);
                const newKeyRef = uniqueCol.doc(buildUniqueDocId(field.id, newNorm));
                const exists = await tx.get(newKeyRef);
                if (exists.exists && exists.data()?.recordId !== recordId) {
                    throw new Error(`Value for '${field.name}' must be unique. '${newVal}' already exists.`);
                }
                // If value changed, remove old key, set new key
                if (oldVal !== undefined && oldVal !== null && normalizeUnique(oldVal) !== newNorm) {
                    const oldRef = uniqueCol.doc(buildUniqueDocId(field.id, normalizeUnique(oldVal)));
                    tx.delete(oldRef);
                }
                tx.set(newKeyRef, {
                    fieldId: field.id,
                    value: newVal,
                    normalizedValue: newNorm,
                    recordId,
                    updated_at: Timestamp.fromDate(new Date()),
                });
            }
            tx.update(recordRef, updatedRecord);
            tx.update(tableRef, { updated_at: new Date() });
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
