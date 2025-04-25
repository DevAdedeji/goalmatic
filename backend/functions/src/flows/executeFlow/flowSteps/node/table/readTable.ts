import { WorkflowContext } from "@upstash/workflow";
import { FlowNode } from "../../../type";
import { goals_db } from "../../../../../init";

const readTable = async (context: WorkflowContext, step: FlowNode, previousStepResult: any) => {
    console.log('previousStepResult', previousStepResult);
    console.log(step.name, step.propsData);
    
    try {
        // Extract user ID from the flow data
        const { userId } = context.requestPayload as { userId: string };
        if (!userId) {
            throw new Error('User ID not found in flow data');
        }
        
        // Extract query parameters from props
        const { 
            tableId,
            recordId,
            limit = 10
        } = step.propsData;
        
        if (!tableId) {
            return {
                success: false,
                error: 'Table ID is required',
                records: []
            };
        }
        
        // Get the table document
        const tableDoc = await goals_db.collection('tables').doc(tableId).get();
        if (!tableDoc.exists) {
            return {
                success: false,
                error: 'Table not found',
                records: []
            };
        }
        
        const tableData = tableDoc.data();
        
        // Check if the table belongs to the user
        if (tableData?.creator_id !== userId) {
            return {
                success: false,
                error: 'Unauthorized access to table',
                records: []
            };
        }
        
        // If a specific record ID is provided, return just that record
        if (recordId) {
            const records = tableData.records || [];
            const record = records.find(r => r.id === recordId);
            
            if (!record) {
                return {
                    success: false,
                    message: 'Record not found',
                    records: []
                };
            }
            
            return {
                success: true,
                message: 'Record retrieved successfully',
                records: [record]
            };
        }
        
        // Otherwise, return all records (with optional limit)
        let records = tableData.records || [];
        
        if (limit && records.length > limit) {
            records = records.slice(0, limit);
        }
        
        return {
            success: true,
            message: 'Records retrieved successfully',
            table: {
                id: tableData.id,
                name: tableData.name,
                description: tableData.description,
                fields: tableData.fields
            },
            count: records.length,
            records: records
        };
    } catch (error) {
        console.error('Error in readTable node:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
            records: []
        };
    }
};

export const readTableNode = {
    nodeId: 'TABLE_READ',
    run: readTable
};
