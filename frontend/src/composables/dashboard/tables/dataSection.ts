import { ref, computed } from 'vue'
import { useEditTable } from '@/composables/dashboard/tables/edit'
import { useFetchTableRecords } from '@/composables/dashboard/tables/fetch'
import { useTablesModal } from '@/composables/core/modals'
import { useConfirmationModal } from '@/composables/core/confirmation'
import { Record, TableData } from '@/composables/dashboard/tables/types'

export const useTableDataSection = (tableData: TableData) => {
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
    const index = selectedRecords.value.indexOf(recordId)
    if (index === -1) {
      selectedRecords.value.push(recordId)
    } else {
      selectedRecords.value.splice(index, 1)
    }
  }

  const isRecordSelected = (recordId: string) => {
    return selectedRecords.value.includes(recordId)
  }

  const toggleSelectAll = () => {
    if (isAllSelected.value) {
      selectedRecords.value = []
    } else {
      selectedRecords.value = tableRecords.value?.map((record) => record.id) || []
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
          const success = await removeMultipleRecordsFromTable(tableData, selectedRecords.value)
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
    if (tableData.fields) {
      tableData.fields.forEach((field) => {
        newRecord[field.id] = getDefaultValueForType(field.type)
      })
    }

    recordForm.value = newRecord
    editingRecordIndex.value = -1

    useTablesModal().openRecordModal({
      recordForm: recordForm.value,
      fields: tableData.fields || [],
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
        fields: tableData.fields || [],
        editingRecordIndex: editingRecordIndex.value,
        onSave: saveRecord
      })
    }
  }

  const saveRecord = async () => {
    localLoading.value = true
    try {
      if (editingRecordIndex.value === -1) {
        await addRecordToTable(tableData, recordForm.value)
      } else {
        await updateRecordInTable(
          tableData,
          recordForm.value?.id,
          recordForm.value
        )
      }

      await fetchTableRecords(tableData.id)

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
          await removeRecordFromTable(tableData, recordId)
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
        return `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`
      }
      default:
        return ''
    }
  }

  const initializeRecords = async () => {
    if (tableData.id) {
      await fetchTableRecords(tableData.id)
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
    initializeRecords
  }
}
