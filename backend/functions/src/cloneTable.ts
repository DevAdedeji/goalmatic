import { onCall, HttpsError } from 'firebase-functions/v2/https'
import { goals_db } from './init'
import { v4 as uuidv4 } from 'uuid'
import { Timestamp } from 'firebase-admin/firestore'

/**
 * Cloud function to clone a table
 * This function creates a copy of an existing table with the same structure
 * but without the records
 */
export const cloneTable = onCall({
  cors: true,
  region: 'us-central1'
}, async (request) => {
  try {
    // Check if the user is authenticated
    if (!request.auth) {
      throw new HttpsError('unauthenticated', 'User must be authenticated to clone a table')
    }

    const uid = request.auth.uid
    const { agentId } = request.data

    if (!agentId) {
      throw new HttpsError('invalid-argument', 'Agent ID is required')
    }

    // Get the agent to find the table ID
    const agentDoc = await goals_db.collection('agents').doc(agentId).get()

    if (!agentDoc.exists) {
      throw new HttpsError('not-found', 'Agent not found')
    }

    const agentData = agentDoc.data()

    // Get the table ID from the agent's toolsConfig
    const tableId = agentData?.spec?.toolsConfig?.TABLE?.selected_table_id

    if (!tableId) {
      throw new HttpsError('not-found', 'No table ID found in agent configuration')
    }

    // Get the original table
    const tableDoc = await goals_db.collection('tables').doc(tableId).get()

    if (!tableDoc.exists) {
      throw new HttpsError('not-found', 'Table not found')
    }

    const tableData = tableDoc.data()

    // Check if the original table creator has access to the table
    // Note: We're allowing cloning even if the current user is not the creator
    // because they're cloning an agent that uses this table

    // Generate a new ID for the cloned table
    const newTableId = uuidv4()
    const now = Timestamp.now()

    if (!tableData) {
      throw new HttpsError('internal', 'Table data is undefined')
    }

    // Create a copy of the table data without the records field
    const { records, ...tableDataWithoutRecords } = tableData

    // Create the cloned table data
    const clonedTableData = {
      ...tableDataWithoutRecords,
      id: newTableId,
      name: `Copy of ${tableData.name}`,
      creator_id: uid,
      created_at: now,
      updated_at: now,
      cloned_from: {
        id: tableId,
        name: tableData.name,
        creator_id: tableData.creator_id
      }
    }


    // Save the cloned table to Firestore
    await goals_db.collection('tables').doc(newTableId).set(clonedTableData)

    // Return the new table ID
    return {
      success: true,
      tableId: newTableId,
      message: 'Table cloned successfully'
    }
  } catch (error) {
    console.error('Error cloning table:', error)
    throw new HttpsError(
      'internal',
      `Error cloning table: ${error instanceof Error ? error.message : 'Unknown error'}`
    )
  }
})
