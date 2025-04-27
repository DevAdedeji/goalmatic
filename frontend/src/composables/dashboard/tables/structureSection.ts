import { ref } from 'vue'
import { useEditTable } from '@/composables/dashboard/tables/edit'
import { useTablesModal } from '@/composables/core/modals'
import { useConfirmationModal } from '@/composables/core/confirmation'
import { Field, TableData } from '@/composables/dashboard/tables/types'

// Define field form interface
interface FieldForm extends Omit<Field, 'options'> {
  options: string[];
  optionsText: string;
}

export const useTableStructureSection = (tableData: TableData) => {
  const { updateFieldInTable, removeFieldFromTable, addFieldToTable } = useEditTable()
  const localLoading = ref(false)

  // Field management
  const editingFieldIndex = ref(-1)
  const fieldForm = ref<FieldForm>({
    id: crypto.randomUUID(),
    name: '',
    type: 'text',
    description: '',
    required: false,
    options: [],
    optionsText: ''
  })

  const resetFieldForm = () => {
    fieldForm.value = {
      id: crypto.randomUUID(),
      name: '',
      type: 'text',
      description: '',
      required: false,
      options: [],
      optionsText: ''
    }
    editingFieldIndex.value = -1
  }

  const addNewField = () => {
    // Reset form
    resetFieldForm()

    // Open the field modal with the current form data and editing index
    useTablesModal().openFieldModal({
      fieldForm: fieldForm.value,
      editingFieldIndex: editingFieldIndex.value,
      onSave: saveField
    })
  }

  const editField = (index: number) => {
    if (!tableData.fields) return

    const field = tableData.fields[index]
    if (!field) return

    // Clone the field to avoid direct mutation
    fieldForm.value = {
      ...JSON.parse(JSON.stringify(field)),
      optionsText: field.options ? field.options.join('\n') : ''
    }
    editingFieldIndex.value = index

    // Open the field modal with the current form data and editing index
    useTablesModal().openFieldModal({
      fieldForm: fieldForm.value,
      editingFieldIndex: editingFieldIndex.value,
      onSave: saveField
    })
  }

  const saveField = async () => {
    // Process options if it's a select field
    if (fieldForm.value.type === 'select') {
      fieldForm.value.options = fieldForm.value.optionsText
        .split('\n')
        .map((option) => option.trim())
        .filter((option) => option)
    }

    // Check if we're adding a new field or updating an existing one
    if (editingFieldIndex.value === -1) {
      // Add new field
      await addFieldToTable(tableData, fieldForm.value)
    } else if (tableData.fields && tableData.fields[editingFieldIndex.value]) {
      // Update existing field
      await updateFieldInTable(
        tableData,
        tableData.fields[editingFieldIndex.value].id,
        fieldForm.value
      )
    }

    // Close the modal
    useTablesModal().closeFieldModal()
  }

  const deleteField = async (index: number) => {
    if (!tableData.fields || !tableData.fields[index]) return

    useConfirmationModal().openAlert({
      type: 'Alert',
      title: 'Delete Field',
      desc: 'Are you sure you want to delete this field? This will also remove this field from all records.',
      call_function: async () => {
        localLoading.value = true
        try {
          await removeFieldFromTable(tableData, tableData.fields[index].id)
        } catch (error) {
          console.error('Error deleting field:', error)
        } finally {
          localLoading.value = false
        }
      },
      loading: localLoading
    })
  }

  return {
    fieldForm,
    editingFieldIndex,
    addNewField,
    editField,
    saveField,
    deleteField
  }
}
