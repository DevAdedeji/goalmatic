import { ref, reactive } from 'vue'
import { v4 as uuidv4 } from 'uuid'
import { Timestamp } from 'firebase/firestore'
import { setFirestoreDocument } from '@/firebase/firestore/create'
import { useUser } from '@/composables/auth/user'
import { useAlert } from '@/composables/core/notification'
import { TableField } from './types'

// Form for creating a new table
const createTableForm = reactive({
  name: '',
  description: '',
  type: 'standard',
  fields: [] as TableField[],

  records: [] // Records will store the actual data entries
})

export const useCreateTable = () => {
  const { id: user_id } = useUser()
  const loading = ref(false)

  const resetForm = () => {
    createTableForm.name = ''
    createTableForm.description = ''
    createTableForm.type = 'standard'
    createTableForm.fields = []

    createTableForm.records = []
  }

  const createTable = async () => {
    if (!user_id.value) return

    loading.value = true
    try {
      const id = uuidv4()
      const table_data = {
        ...createTableForm,
        id,
        creator_id: user_id.value,
        created_at: Timestamp.fromDate(new Date()),
        updated_at: Timestamp.fromDate(new Date())
      }

      await setFirestoreDocument('tables', id, table_data)
      useAlert().openAlert({ type: 'SUCCESS', msg: 'Table created successfully' })
      resetForm()
      return id
    } catch (error: any) {
      console.error('Error creating table:', error)
      useAlert().openAlert({ type: 'ERROR', msg: `Error creating table: ${error.message}` })
      return null
    } finally {
      loading.value = false
    }
  }

  // Helper function to add a field to the table
  const addField = (field: TableField) => {
    // Create a new field with a unique ID if not provided
    const newField = {
      ...field,
      id: field.id || uuidv4()
    }
    createTableForm.fields.push(newField)
    return newField.id
  }

  // Helper function to remove a field from the table
  const removeField = (fieldId: string) => {
    const index = createTableForm.fields.findIndex((field) => field.id === fieldId)
    if (index !== -1) {
      createTableForm.fields.splice(index, 1)
      return true
    }
    return false
  }

  // Helper function to update a field
  const updateField = (fieldId: string, updates: Partial<TableField>) => {
    const field = createTableForm.fields.find((field) => field.id === fieldId)
    if (field) {
      Object.assign(field, updates)
      return true
    }
    return false
  }

  return {
    createTable,
    createTableForm,
    loading,
    resetForm,
    addField,
    removeField,
    updateField
  }
}
