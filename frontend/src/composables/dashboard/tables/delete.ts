import { ref } from 'vue'
import { useUser } from '@/composables/auth/user'
import { deleteFirestoreDocument } from '@/firebase/firestore/delete'
import { useAlert } from '@/composables/core/notification'
import { useConfirmationModal } from '@/composables/core/confirmation'

// Store the table data to be deleted
const deleteTableData = ref()

export const useDeleteTable = () => {
  const loading = ref(false)
  const { id: user_id } = useUser()

  const setDeleteTableData = (table: any) => {
    deleteTableData.value = table

    useConfirmationModal().openAlert({
      type: 'Alert',
      title: 'Delete Table',
      desc: `Are you sure you want to delete "${deleteTableData.value.name || 'this table'}"? All data in this table will be permanently lost.`,
      call_function: deleteTable,
      loading
    })
  }

  const deleteTable = async () => {
    if (!deleteTableData.value?.id) return

    // Check if user is authorized to delete this table
    if (deleteTableData.value.creator_id !== user_id.value) {
      useAlert().openAlert({ type: 'ERROR', msg: 'You do not have permission to delete this table' })
      return
    }

    loading.value = true
    try {
      await deleteFirestoreDocument('tables', deleteTableData.value.id)
      useConfirmationModal().closeAlert()
      useAlert().openAlert({ type: 'SUCCESS', msg: 'Table deleted successfully' })
    } catch (error: any) {
      console.error('Error deleting table:', error)
      useAlert().openAlert({ type: 'ERROR', msg: `Error deleting table: ${error.message}` })
    } finally {
      loading.value = false
      deleteTableData.value = null
    }
  }

  return {
    loading,
    deleteTable,
    setDeleteTableData
  }
}
