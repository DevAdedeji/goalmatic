import { ref, computed } from 'vue'
import { useEditTable } from '@/composables/dashboard/tables/edit'
import { useFetchTableRecords, useFetchUserTables } from '@/composables/dashboard/tables/fetch'
import { useTablesModal } from '@/composables/core/modals'
import { useConfirmationModal } from '@/composables/core/confirmation'
import { Record } from '@/composables/dashboard/tables/types'


export const useTableDataSection = () => {
  const { tableData } = useFetchUserTables()
  const { addRecordToTable, updateRecordInTable, removeRecordFromTable, removeMultipleRecordsFromTable, loading: editLoading } = useEditTable()
  const { fetchTableRecords, tableRecords, loading: fetchLoading } = useFetchTableRecords()

  const editingRecordIndex = ref(-1)
  const recordForm = ref({} as any)
  const localLoading = ref(false)

  const loading = computed(() => editLoading.value || fetchLoading.value || localLoading.value)

  const resetForm = () => {
    recordForm.value = {}
    editingRecordIndex.value = -1
  }

  const selectedRecords = ref<string[]>([])

  const isAllSelected = computed(() => {
    if (!tableRecords.value || tableRecords.value.length === 0) return false
    return tableRecords.value.length === selectedRecords.value.length
  })

  const toggleRecordSelection = (recordId: string) => {
    // Create a new array to ensure reactivity
    const index = selectedRecords.value.indexOf(recordId)
    if (index === -1) {
      selectedRecords.value = [...selectedRecords.value, recordId]
    } else {
      selectedRecords.value = selectedRecords.value.filter((id) => id !== recordId)
    }
  }

  const isRecordSelected = (recordId: string) => {
    return selectedRecords.value.includes(recordId)
  }

  const toggleSelectAll = () => {
    if (isAllSelected.value) {
      // Create a new empty array to ensure reactivity
      selectedRecords.value = []
    } else {
      // Create a new array with all record IDs to ensure reactivity
      selectedRecords.value = [...(tableRecords.value?.map((record) => record.id) || [])]
    }
  }

  const deleteSelectedRecords = async () => {
    if (selectedRecords.value.length === 0) return

    useConfirmationModal().openAlert({
      type: 'Alert',
      title: 'Delete Selected Records',
      desc: `Are you sure you want to delete ${selectedRecords.value.length} selected record(s)?`,
      call_function: async () => {
        localLoading.value = true
        try {
          const success = await removeMultipleRecordsFromTable(tableData.value, selectedRecords.value)
          if (success) {
            selectedRecords.value = []
          }
        } catch (error) {
          console.error('Error deleting selected records:', error)
        } finally {
          localLoading.value = false
          useConfirmationModal().closeAlert()
        }
      },
      loading: localLoading
    })
  }

  const addNewRecord = () => {
    resetForm()

    const newRecord: Record = { id: crypto.randomUUID() }
    if (tableData.value.fields) {
      tableData.value.fields.forEach((field) => {
        newRecord[field.id] = getDefaultValueForType(field.type)
      })
    }

    recordForm.value = newRecord
    editingRecordIndex.value = -1

    useTablesModal().openRecordModal({
      recordForm: recordForm.value,
      fields: tableData.value.fields || [],
      editingRecordIndex: editingRecordIndex.value,
      onSave: saveRecord
    })
  }

  const editRecord = (recordId: string) => {
    resetForm()

    const record = tableRecords.value.find((r) => r.id === recordId)
    if (record) {
      recordForm.value = JSON.parse(JSON.stringify(record))
      editingRecordIndex.value = tableRecords.value.findIndex((r) => r.id === recordId)

      useTablesModal().openRecordModal({
        recordForm: recordForm.value,
        fields: tableData.value.fields || [],
        editingRecordIndex: editingRecordIndex.value,
        onSave: saveRecord
      })
    }
  }

  const saveRecord = async () => {
    localLoading.value = true
    try {
      if (editingRecordIndex.value === -1) {
        await addRecordToTable(tableData.value, recordForm.value)
      } else {
        await updateRecordInTable(
          tableData.value,
          recordForm.value?.id,
          recordForm.value
        )
      }

      await fetchTableRecords(tableData.value.id)

      resetForm()

      useTablesModal().closeRecordModal()
    } catch (error) {
      console.error('Error saving record:', error)
    } finally {
      localLoading.value = false
    }
  }

  const deleteRecord = async (recordId: string) => {
    useConfirmationModal().openAlert({
      type: 'Alert',
      title: 'Delete Record',
      desc: 'Are you sure you want to delete this record?',
      call_function: async () => {
        localLoading.value = true
        try {
          await removeRecordFromTable(tableData.value, recordId)
        } catch (error) {
          console.error('Error deleting record:', error)
        } finally {
          localLoading.value = false
          useConfirmationModal().closeAlert()
        }
      },
      loading: localLoading
    })
  }

  const getDefaultValueForType = (type: string): any => {
    switch (type) {
      case 'number':
        return 0
      case 'boolean':
        return false
      case 'date':
        return new Date().toISOString().split('T')[0]
      case 'time': {
        const now = new Date()
        // Return in HH:MM format for the time input
        return `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`
      }
      default:
        return ''
    }
  }

  const initializeRecords = async () => {
    if (tableData.value.id) {
      await fetchTableRecords(tableData.value.id)
    }
  }

  return {
    tableRecords,
    loading,
    selectedRecords,
    isAllSelected,
    toggleRecordSelection,
    isRecordSelected,
    toggleSelectAll,
    deleteSelectedRecords,
    addNewRecord,
    editRecord,
    deleteRecord,
    initializeRecords,
    tableData
  }
}
