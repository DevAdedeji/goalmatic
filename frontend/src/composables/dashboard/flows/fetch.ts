import { ref, computed } from 'vue'
import { useUser } from '@/composables/auth/user'
import { getFirestoreCollectionWithWhereQuery } from '@/firebase/firestore/query'
import { useAlert } from '@/composables/core/notification'
import { getSingleFirestoreDocument } from '@/firebase/firestore/fetch'

// Store for flows data
const userFlows = ref([] as any[])
const flowData = ref<any>(null)
const loading = ref(false)

// Track fetched states
const hasInitialFetch = ref(false)

export const useFetchUserFlows = () => {
  const { id: user_id } = useUser()

  const fetchAllFlows = async () => {
    if (!user_id.value) return
    userFlows.value = []
    loading.value = true
    try {
      await getFirestoreCollectionWithWhereQuery(
        'flows',
        userFlows,
        { name: 'creator_id', operator: '==', value: user_id.value }
      )
      hasInitialFetch.value = true
    } catch (error: any) {
      console.error('Error fetching flows:', error)
      useAlert().openAlert({ type: 'ERROR', msg: `Error fetching flows: ${error.message}` })
    } finally {
      loading.value = false
    }
  }

  // Get a single flow by ID
  const fetchFlowById = async (flow_id: string) => {
    loading.value = true
    if (import.meta.server) return

    try {
      await getSingleFirestoreDocument('flows', flow_id, flowData)
      return flowData.value
    } catch (error: any) {
      console.error('Error fetching flow by ID:', error)
      if (error.code === 'permission-denied') {
        useAlert().openAlert({
          type: 'ERROR',
          msg: "You don't have permission to access this flow. It may be private"
        })
      } else {
        useAlert().openAlert({ type: 'ERROR', msg: `Error fetching flow: ${error.message}` })
      }
      return null
    } finally {
      loading.value = false
    }
  }

  // Computed property for active flows
  const activeFlows = computed(() => {
    return userFlows.value.filter((flow) => flow.status === 1)
  })

  // Computed property for draft flows
  const draftFlows = computed(() => {
    return userFlows.value.filter((flow) => flow.status === 0)
  })

  return {
    flowData,
    userFlows,
    loading,
    fetchAllFlows,
    fetchFlowById,
    activeFlows,
    draftFlows,
    hasInitialFetch
  }
}
