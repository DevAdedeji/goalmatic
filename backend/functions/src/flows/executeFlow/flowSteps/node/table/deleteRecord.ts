import { WorkflowContext } from "@upstash/workflow";
import { FlowNode } from "../../../type";
import { goals_db } from "../../../../../init";

const deleteRecord = async (context: WorkflowContext, step: FlowNode, previousStepResult: any) => {
    console.log('previousStepResult', previousStepResult);
    console.log(step.name, step.propsData);
    
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
        
        // Get the current records array
        const records = [...(tableData.records || [])];
        
        // Find the record to delete
        const recordIndex = records.findIndex(r => r.id === recordId);
        if (recordIndex === -1) {
            return {
                success: false,
                error: 'Record not found'
            };
        }
        
        // Store record info for response
        const deletedRecord = records[recordIndex];
        
        // Remove the record from the array
        records.splice(recordIndex, 1);
        
        // Update the table in Firestore
        await goals_db.collection('tables').doc(tableId).update({
            records: records,
            updated_at: new Date()
        });
        
        return {
            success: true,
            message: 'Record deleted successfully',
            record: {
                id: deletedRecord.id
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
