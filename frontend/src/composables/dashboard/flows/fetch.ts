import { ref, computed } from 'vue'
import { useFlowSearch } from './search'
import { useUser } from '@/composables/auth/user'
import { getFirestoreCollectionWithWhereQuery } from '@/firebase/firestore/query'
import { useAlert } from '@/composables/core/notification'
import { getSingleFirestoreDocument } from '@/firebase/firestore/fetch'

// Store for flows data
const userFlows = ref([] as any[])
const flowData = ref<any>(null)
const loading = ref(true)

// Store for all flows (previously public flows)
const allFlows = ref<any[]>([])

// Track fetched states
const hasInitialFetch = ref(false)

export const useFetchUserFlows = () => {
  const { id: user_id } = useUser()
  const { getPublicFlowsFromConvex } = useFlowSearch()

  const fetchUserFlows = async () => {
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

  // Fetch all flows (previously public flows)
  const fetchAllFlows = async () => {
    loading.value = true
    try {
      const flows = await getPublicFlowsFromConvex()
      allFlows.value = flows
    } catch (error) {
      console.error('Error fetching all flows:', error)
      allFlows.value = []
    } finally {
      loading.value = false
    }
  }

  // Get community flows (all flows not created by the current user)
  const communityFlows = computed(() => {
    return allFlows.value.filter(
      (flow) => flow.creator_id !== user_id.value
    )
  })

  // Get all flows (renamed from allPublicFlows)
  const publicFlows = computed(() => {
    return allFlows.value
  })




  return {
    flowData,
    userFlows,
    loading,
    fetchUserFlows,
    hasInitialFetch,
    // All flows state (previously public flows)
    publicFlows,
    communityFlows,
    // All flows functions (previously public flows functions)
    fetchAllFlows
  }
}
