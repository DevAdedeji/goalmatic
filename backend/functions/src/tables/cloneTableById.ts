import { onCall, HttpsError } from 'firebase-functions/v2/https'
import { goals_db } from '../init'
import { v4 as uuidv4 } from 'uuid'
import { Timestamp } from 'firebase-admin/firestore'

/**
 * Clone a table by source table ID (structure only, no records)
 */
export const cloneTableById = onCall({ cors: true, region: 'us-central1' }, async (request) => {
    try {
        if (!request.auth) {
            throw new HttpsError('unauthenticated', 'User must be authenticated to clone a table')
        }

        const uid = request.auth.uid
        const { tableId } = request.data as { tableId?: string }
        if (!tableId) {
            throw new HttpsError('invalid-argument', 'tableId is required')
        }

        const tableDoc = await goals_db.collection('tables').doc(tableId).get()
        if (!tableDoc.exists) {
            throw new HttpsError('not-found', 'Table not found')
        }

        const tableData = tableDoc.data()
        if (!tableData) {
            throw new HttpsError('internal', 'Table data is undefined')
        }

        const newTableId = uuidv4()
        const now = Timestamp.now()
        const { records, ...rest } = tableData

        const clonedTableData = {
            ...rest,
            id: newTableId,
            name: `Copy of ${tableData.name}`,
            creator_id: uid,
            created_at: now,
            updated_at: now,
            cloned_from: { id: tableId, name: tableData.name, creator_id: tableData.creator_id }
        }

        await goals_db.collection('tables').doc(newTableId).set(clonedTableData)

        return { success: true, tableId: newTableId, message: 'Table cloned successfully' }
    } catch (error) {
        throw new HttpsError('internal', `Error cloning table: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
})

