import { goals_db } from "../../../../../../init";


export const createRecordChecks = async (userId: string, tableId, dataContext) => {

    if (!userId) { throw new Error('User ID not found in flow data'); }

    if (!tableId) { return { success: false, error: 'Table ID is required', }; }

    if (!dataContext) { return { success: false, error: 'Data context is required', }; }


    const tableDoc = await goals_db.collection('tables').doc(tableId).get();
    if (!tableDoc.exists) { return { success: false, error: 'Table not found', }; }

    const tableData = tableDoc.data();

    if (tableData?.creator_id !== userId) {
        return {
            success: false,
            error: 'Unauthorized access to table',
        };
    }

    return { success: true, tableData, error: null };
}