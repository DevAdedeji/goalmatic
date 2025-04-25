import { WorkflowContext } from "@upstash/workflow";
import { FlowNode } from "../../../type";
import { goals_db } from "../../../../../init";

const updateRecord = async (context: WorkflowContext, step: FlowNode, previousStepResult: any) => {
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
        
        // Get the current records array
        const records = [...(tableData.records || [])];
        
        // Find the record to update
        const recordIndex = records.findIndex(r => r.id === recordId);
        if (recordIndex === -1) {
            return {
                success: false,
                error: 'Record not found'
            };
        }
        
        // Get the existing record
        const existingRecord = records[recordIndex];
        
        // Create the updated record
        const updatedRecord = {
            ...existingRecord,
            ...updatedFields,
            id: recordId, // Ensure ID doesn't change
            created_at: existingRecord.created_at, // Preserve creation timestamp
            updated_at: new Date() // Update the updated_at timestamp
        };
        
        // Validate the record against the table fields
        const fields = tableData.fields || [];
        for (const field of fields) {
            if (field.required && (updatedRecord[field.id] === undefined || updatedRecord[field.id] === null || updatedRecord[field.id] === '')) {
                return {
                    success: false,
                    error: `Required field '${field.name}' is missing`
                };
            }
        }
        
        // Update the record in the array
        records[recordIndex] = updatedRecord;
        
        // Update the table in Firestore
        await goals_db.collection('tables').doc(tableId).update({
            records: records,
            updated_at: new Date()
        });
        
        return {
            success: true,
            message: 'Record updated successfully',
            record: updatedRecord
        };
    } catch (error) {
        console.error('Error in updateRecord node:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error'
        };
    }
};

export const updateRecordNode = {
    nodeId: 'TABLE_UPDATE',
    run: updateRecord
};
