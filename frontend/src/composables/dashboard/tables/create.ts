import { ref, reactive, computed } from 'vue'
import { v4 as uuidv4 } from 'uuid'
import { Timestamp } from 'firebase/firestore'
import type { TableField } from './types'
import { setFirestoreDocument } from '@/firebase/firestore/create'
import { useUser } from '@/composables/auth/user'
import { useAlert } from '@/composables/core/notification'

// Form for creating a new table
const createTableForm = reactive({
  name: '',
  description: '',
  fields: [] as TableField[]
})

export const useCreateTable = () => {
  const { id: user_id, userProfile } = useUser()
  const loading = ref(false)

  const isDisabled = computed(() => {
    return !createTableForm.name.trim()
  })

  const resetForm = () => {
    createTableForm.name = ''
    createTableForm.description = ''
    createTableForm.fields = []
  }

  const createTable = async () => {
    if (!user_id.value) return

    loading.value = true
    try {
      const tableId = uuidv4()
      const table_data = {
        ...createTableForm,
        id: tableId,
        creator_id: user_id.value,
        created_at: Timestamp.fromDate(new Date()),
        updated_at: Timestamp.fromDate(new Date()),
        public: false,
        allowed_users: [user_id.value]
      }

      await setFirestoreDocument('tables', tableId, table_data)
      useAlert().openAlert({ type: 'SUCCESS', msg: 'Table created successfully' })
      resetForm()

		if (tableId) {
			useRouter().push(`/tables/${tableId}`)
		} else {
			useAlert().openAlert({
				type: 'ERROR',
				msg: 'Failed to create table. Please try again.'
			})
		}
      return tableId
    } catch (error: any) {
      console.error('Error creating table:', error)
      useAlert().openAlert({ type: 'ERROR', msg: `Error creating table: ${error.message}` })
      return null
    } finally {
      loading.value = false
    }
  }

  const addField = (field: TableField) => {
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

  const createNewTable = async () => {
    const id = await createTable()
    if (id) {
      await useRouter().push(`/tables/${id}`)
    }
  }

  const createTableModal = async () => {
    const id = await createTable()
    if (id) {
      // Import and close modal
      const { useTablesModal } = await import('@/composables/core/modals')
      await useRouter().push(`/tables/${id}`)
      useTablesModal().closeCreateTable()
      resetForm()
    }
  }

  return {
    createTable,
    createTableForm,
    loading,
    resetForm,
    addField,
    removeField,
    updateField,
    isDisabled,
    createTableModal,
    createNewTable
  }
}

