import { WorkflowContext } from "@upstash/workflow";
import { FlowNode } from "../../../type";
import { goals_db } from "../../../../../init";

const readTable = async (context: WorkflowContext, step: FlowNode, previousStepResult: any) => {


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

        // Query records
        let query = goals_db.collection('tables').doc(tableId).collection('records');
        if (recordId) {
            query = query.where('id', '==', recordId) as any;
        }
        const recordsSnap = await query.limit(limit).get();
        const records = recordsSnap.docs.map(doc => doc.data());

        return {
            success: true,
            records,
        };
    } catch (error: any) {
        return {
            success: false,
            error: error?.message || error,
            records: [],
        };
    }
};

export const readTableNode = {
    nodeId: 'TABLE_READ',
    run: readTable
};
