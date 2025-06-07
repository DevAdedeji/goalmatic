import { ref, reactive } from 'vue'
import { v4 as uuidv4 } from 'uuid'
import { Timestamp } from 'firebase/firestore'
import { setFirestoreDocument } from '@/firebase/firestore/create'
import { useUser } from '@/composables/auth/user'
import { useAlert } from '@/composables/core/notification'
import { FlowStep, FlowStatus, FlowType } from '@/composables/dashboard/flows/types'


// Form for creating a new flow
const createFlowForm = reactive({
  name: 'Default Flow',
  description: 'Default description',
  type: 'standard' as FlowType,
  steps: [] as FlowStep[],
  status: 0 as FlowStatus,
  isValid: false
})

export const useCreateFlow = () => {
const { id: user_id, userProfile } = useUser()
  const loading = ref(false)

  const resetForm = () => {
    createFlowForm.name = 'Default Flow'
    createFlowForm.description = 'Default description'
    createFlowForm.type = 'standard'
    createFlowForm.steps = []
    createFlowForm.status = 0
    createFlowForm.isValid = false
  }

  const createFlow = async () => {
    if (!user_id.value) return

    loading.value = true
    try {
      const id = uuidv4()
      const flow_data = {
        ...createFlowForm,
        id,
            user: {
                id: user_id.value!,
                name: userProfile.value?.name
            },
        creator_id: user_id.value,
        created_at: Timestamp.fromDate(new Date()),
        updated_at: Timestamp.fromDate(new Date())
      }

      await setFirestoreDocument('flows', id, flow_data)
      useAlert().openAlert({ type: 'SUCCESS', msg: 'Flow created successfully' })
      resetForm()
      loading.value = false
      return id
    } catch (error: any) {
      loading.value = false
      console.error('Error creating flow:', error)
      useAlert().openAlert({ type: 'ERROR', msg: `Error creating flow: ${error.message}` })
      return null
    }
  }

  const createNewFlow = async () => {
    const id = await createFlow()
    useRouter().push(`/flows/${id}`)
  }

  return {
    createNewFlow,
    createFlow,
    createFlowForm,
    loading,
    resetForm
  }
}
