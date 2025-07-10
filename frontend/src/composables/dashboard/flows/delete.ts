import { ref } from 'vue'
import { useUser } from '@/composables/auth/user'
import { deleteFirestoreDocument } from '@/firebase/firestore/delete'
import { useAlert } from '@/composables/core/notification'
import { useConfirmationModal } from '@/composables/core/confirmation'

// Store the flow data to be deleted
const deleteFlowData = ref()

export const useDeleteFlow = () => {
  const loading = ref(false)
  const { id: user_id } = useUser()

  const setDeleteFlowData = (flow: any, onSuccess?: () => void) => {
    deleteFlowData.value = flow

    useConfirmationModal().openAlert({
      type: 'Alert',
      title: 'Delete Flow',
      desc: `Are you sure you want to delete "${deleteFlowData.value.name || 'this flow'}"?`,
      call_function: () => deleteFlow(onSuccess),
      loading
    })
  }

  const deleteFlow = async (onSuccess?: () => void) => {
    if (!deleteFlowData.value?.id) return

    // Check if user is authorized to delete this flow
    if (deleteFlowData.value.creator_id !== user_id.value) {
      useAlert().openAlert({ type: 'ERROR', msg: 'You do not have permission to delete this flow' })
      return
    }

    loading.value = true
    try {
      await deleteFirestoreDocument('flows', deleteFlowData.value.id)
      useConfirmationModal().closeAlert()
      useAlert().openAlert({ type: 'SUCCESS', msg: 'Flow deleted successfully' })

      // Call the success callback if provided
      if (onSuccess) {
        onSuccess()
      }
    } catch (error: any) {
      console.error('Error deleting flow:', error)
      useAlert().openAlert({ type: 'ERROR', msg: `Error deleting flow: ${error.message}` })
    } finally {
      loading.value = false
    }
  }

  return {
    loading,
    deleteFlow,
    setDeleteFlowData
  }
}
