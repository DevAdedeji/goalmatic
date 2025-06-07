import { WorkflowContext } from "@upstash/workflow";
import { FlowNode } from "../../../type";
import { goals_db } from "../../../../../init";

const deleteRecord = async (context: WorkflowContext, step: FlowNode, previousStepResult: any) => {

    try {
        // Extract user ID from the flow data
        const { userId } = context.requestPayload as { userId: string };
        if (!userId) {
            throw new Error('User ID not found in flow data');
        }

        // Extract parameters from props
        const {
            tableId,
            recordId
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

        // Check if the record exists in the subcollection
        const recordDoc = await goals_db.collection('tables').doc(tableId).collection('records').doc(recordId).get();

        if (!recordDoc.exists) {
            return {
                success: false,
                error: 'Record not found'
            };
        }

        // Store record info for response
        const deletedRecord = recordDoc.data();

        // Delete the record from the subcollection
        await goals_db.collection('tables').doc(tableId).collection('records').doc(recordId).delete();

        // Update the table's updated_at timestamp
        await goals_db.collection('tables').doc(tableId).update({
            updated_at: new Date()
        });

        return {
            success: true,
            message: 'Record deleted successfully',
            record: {
                id: deletedRecord?.id
            }
        };
    } catch (error) {
        console.error('Error in deleteRecord node:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error'
        };
    }
};

export const deleteRecordNode = {
    nodeId: 'TABLE_DELETE',
    run: deleteRecord
};
