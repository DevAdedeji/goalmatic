import { goals_db } from '../../../init'

export const verifyTableAccess = async (uid: string, tableId?: string): Promise<{ exists: boolean, tableData?: any }> => {
    // If a specific table ID is provided, check if it exists and belongs to the user
    if (tableId) {
        const tableDoc = await goals_db.collection('tables').doc(tableId).get();
        
        if (!tableDoc.exists) {
            return { exists: false };
        }
        
        const tableData = tableDoc.data();
        
        // Check if the table belongs to the user
        if (tableData?.creator_id !== uid) {
            return { exists: false };
        }
        
        return { exists: true, tableData };
    }
    
    // Otherwise, just check if the user exists
    const userDoc = await goals_db.collection('users').doc(uid).get();
    
    return {
        exists: userDoc.exists
    };
}
