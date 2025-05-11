import { EnhancedWorkflowContext } from "../../../context";
import { FlowNode } from "../../../type";
import { goals_db } from "../../../../../init";
import { v4 as uuidv4 } from 'uuid';
import { Timestamp } from 'firebase-admin/firestore';

const createRecord = async (context: EnhancedWorkflowContext, step: FlowNode, previousStepResult: any) => {
    // Access all previous node results
    const allPreviousResults = context.getAllPreviousResults();

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
        const now = new Date();
        const recordRef = goals_db.collection('tables').doc(tableId).collection('records').doc(recordId);
        await recordRef.set({
            ...record,
            id: recordId,
            created_at: Timestamp.fromDate(now),
            updated_at: Timestamp.fromDate(now),
            creator_id: userId
        });

        return {
            success: true,
            recordId,
            created_at: now.toISOString(),
            record,
            context: { previousResults: allPreviousResults }
        };
    } catch (error: any) {
        return {
            success: false,
            error: error?.message || error,
            context: { previousResults: allPreviousResults }
        };
    }
};

export const createRecordNode = {
    nodeId: 'TABLE_CREATE',
    run: createRecord
};
