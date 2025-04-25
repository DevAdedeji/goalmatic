import { ref } from 'vue'
import { Timestamp } from 'firebase/firestore'
import { v4 as uuidv4 } from 'uuid'
import { updateFirestoreDocument } from '@/firebase/firestore/edit'
import { useUser } from '@/composables/auth/user'
import { useAlert } from '@/composables/core/notification'

// Store the selected table for editing
const selectedTable = ref()

export const useEditTable = () => {
  const { id: user_id } = useUser()
  const loading = ref(false)

  // Select a table for editing
  const highlightTable = (table: Record<string, any>) => {
    selectedTable.value = table
  }

  // Update the table
  const updateTable = async (data: Record<string, any>) => {
    if (!user_id.value) return

    // Check if user is authorized to edit this table
    if (data.creator_id !== user_id.value) {
      useAlert().openAlert({ type: 'ERROR', msg: 'You do not have permission to edit this table' })
      return
    }

    loading.value = true
    try {
      const sent_data = {
        ...data,
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
    const records = [...(table.records || [])]

    // Add a unique ID and timestamps
    record.id = record.id || uuidv4()
    record.created_at = Timestamp.fromDate(new Date())
    record.updated_at = Timestamp.fromDate(new Date())

    records.push(record)
    await updateTable({
      ...table,
      records
    })

    return record.id
  }

  // Remove a record from the table
  const removeRecordFromTable = async (table: Record<string, any>, recordId: string) => {
    const records = [...(table.records || [])]
    const index = records.findIndex((record) => record.id === recordId)

    if (index === -1) {
      return false
    }

    records.splice(index, 1)
    await updateTable({
      ...table,
      records
    })

    return true
  }

  // Update a specific record in the table
  const updateRecordInTable = async (table: Record<string, any>, recordId: string, updatedRecord: Record<string, any>) => {
    const records = [...(table.records || [])]
    const index = records.findIndex((record) => record.id === recordId)

    if (index === -1) {
      return false
    }

    // Preserve the record ID and update timestamp
    updatedRecord.id = recordId
    updatedRecord.created_at = records[index].created_at
    updatedRecord.updated_at = Timestamp.fromDate(new Date())

    records[index] = updatedRecord
    await updateTable({
      ...table,
      records
    })

    return true
  }

  // Bulk remove multiple records from the table
  const removeMultipleRecordsFromTable = async (table: Record<string, any>, recordIds: string[]) => {
    if (!recordIds.length) return false

    const records = [...(table.records || [])]
    const filteredRecords = records.filter((record) => !recordIds.includes(record.id))

    // If no records were removed, return false
    if (filteredRecords.length === records.length) {
      return false
    }

    await updateTable({
      ...table,
      records: filteredRecords
    })

    return true
  }

  return {
    selectedTable,
    loading,
    highlightTable,
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
