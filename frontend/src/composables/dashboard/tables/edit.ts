import { ref } from 'vue'
import { Timestamp } from 'firebase/firestore'
import { v4 as uuidv4 } from 'uuid'
import { updateFirestoreDocument, updateFirestoreSubDocument } from '@/firebase/firestore/edit'
import { setFirestoreSubDocument } from '@/firebase/firestore/create'
import { deleteFirestoreSubCollectionDocument } from '@/firebase/firestore/delete'
import { useUser } from '@/composables/auth/user'
import { useAlert } from '@/composables/core/notification'

// Store the selected table for editing


export const useEditTable = () => {
  const { id: user_id } = useUser()
  const loading = ref(false)



  // Update the table
  const updateTable = async (data: Record<string, any>) => {
    if (!user_id.value) return

    if (data.creator_id !== user_id.value) {
      useAlert().openAlert({ type: 'ERROR', msg: 'You do not have permission to edit this table' })
      return
    }

    loading.value = true
    try {
      const { created_at, ...rest } = data
      const sent_data = {
        ...rest,
        updated_at: Timestamp.fromDate(new Date())
      } as Record<string, any>

      await updateFirestoreDocument('tables', sent_data.id, sent_data)
      useAlert().openAlert({ type: 'SUCCESS', msg: 'Table updated successfully' })
    } catch (error: any) {
      console.error('Error updating table:', error)
      useAlert().openAlert({ type: 'ERROR', msg: `Error updating table: ${error.message}` })
    } finally {
      loading.value = false
    }
  }



  // Add a field to a table
  const addFieldToTable = async (table: Record<string, any>, field: Record<string, any>) => {
    const fields = [...(table.fields || [])]

    // Add a unique ID if it doesn't exist
    if (!field.id) {
      field.id = uuidv4()
    }

    fields.push(field)
    await updateTable({
      ...table,
      fields
    })

    return field.id
  }

  // Remove a field from a table
  const removeFieldFromTable = async (table: Record<string, any>, fieldId: string) => {
    const fields = [...(table.fields || [])]
    const index = fields.findIndex((field) => field.id === fieldId)

    if (index === -1) {
      return false
    }

    fields.splice(index, 1)
    await updateTable({
      ...table,
      fields
    })

    return true
  }

  // Update a specific field in a table
  const updateFieldInTable = async (table: Record<string, any>, fieldId: string, updatedField: Record<string, any>) => {
    const fields = [...(table.fields || [])]
    const index = fields.findIndex((field) => field.id === fieldId)
    if (index === -1) {
      return false
    }

    // Preserve the field ID
    updatedField.id = fieldId
    fields[index] = updatedField

    await updateTable({
      ...table,
      fields
    })

    return true
  }

  // Add a record to the table
  const addRecordToTable = async (table: Record<string, any>, record: Record<string, any>) => {
    if (!user_id.value) return

    loading.value = true
    try {
      // Add a unique ID and timestamps
      const recordId = record.id || uuidv4()
      record.id = recordId
      record.created_at = Timestamp.fromDate(new Date())
      record.updated_at = Timestamp.fromDate(new Date())

      // Add the record to the records subcollection
      await setFirestoreSubDocument('tables', table.id, 'records', recordId, record)

      // Update the table's updated_at timestamp
      await updateTable({
        ...table,
        updated_at: Timestamp.fromDate(new Date())
      })

      useAlert().openAlert({ type: 'SUCCESS', msg: 'Record added successfully' })
      return recordId
    } catch (error: any) {
      console.error('Error adding record:', error)
      useAlert().openAlert({ type: 'ERROR', msg: `Error adding record: ${error.message}` })
      return null
    } finally {
      loading.value = false
    }
  }

  // Remove a record from the table
  const removeRecordFromTable = async (table: Record<string, any>, recordId: string) => {
    if (!user_id.value) return false

    loading.value = true
    try {
      // Delete the record from the subcollection
      await deleteFirestoreSubCollectionDocument('tables', table.id, 'records', recordId)

      // Update the table's updated_at timestamp
      await updateTable({
        ...table,
        updated_at: Timestamp.fromDate(new Date())
      })

      useAlert().openAlert({ type: 'SUCCESS', msg: 'Record deleted successfully' })
      return true
    } catch (error: any) {
      console.error('Error removing record:', error)
      useAlert().openAlert({ type: 'ERROR', msg: `Error deleting record: ${error.message}` })
      return false
    } finally {
      loading.value = false
    }
  }

  // Update a specific record in the table
  const updateRecordInTable = async (table: Record<string, any>, recordId: string, updatedRecord: Record<string, any>) => {
    if (!user_id.value) return false

    loading.value = true
    try {
      // Preserve the record ID and update timestamp
      updatedRecord.id = recordId
      updatedRecord.updated_at = Timestamp.fromDate(new Date())

      // Update the record in the subcollection
      await updateFirestoreSubDocument('tables', table.id, 'records', recordId, updatedRecord)
      await updateTable({
        updated_at: Timestamp.fromDate(new Date())
      })

      useAlert().openAlert({ type: 'SUCCESS', msg: 'Record updated successfully' })
      return true
    } catch (error: any) {
      console.error('Error updating record:', error)
      useAlert().openAlert({ type: 'ERROR', msg: `Error updating record: ${error.message}` })
      return false
    } finally {
      loading.value = false
    }
  }

  // Bulk remove multiple records from the table
  const removeMultipleRecordsFromTable = async (table: Record<string, any>, recordIds: string[]) => {
    if (!recordIds.length || !user_id.value) return false

    loading.value = true
    try {
      // Delete each record from the subcollection
      const deletePromises = recordIds.map((recordId) =>
        deleteFirestoreSubCollectionDocument('tables', table.id, 'records', recordId)
      )

      await Promise.all(deletePromises)

      // Update the table's updated_at timestamp
      await updateTable({
        updated_at: Timestamp.fromDate(new Date())
      })

      useAlert().openAlert({ type: 'SUCCESS', msg: `${recordIds.length} records deleted successfully` })
      return true
    } catch (error: any) {
      console.error('Error removing multiple records:', error)
      useAlert().openAlert({ type: 'ERROR', msg: `Error deleting records: ${error.message}` })
      return false
    } finally {
      loading.value = false
    }
  }

  return {
    loading,
    updateTable,

    addFieldToTable,
    removeFieldFromTable,
    updateFieldInTable,
    addRecordToTable,
    removeRecordFromTable,
    updateRecordInTable,
    removeMultipleRecordsFromTable
  }
}
