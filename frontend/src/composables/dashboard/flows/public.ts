import { ref, computed } from 'vue'
import { useFlowSearch } from './search'
import { useUser } from '@/composables/auth/user'

// Store for public flows
const publicFlows = ref<any[]>([])
const publicFlowsLoading = ref(false)

export const usePublicFlows = () => {
  const { getPublicFlowsFromConvex } = useFlowSearch()
  const { id: user_id } = useUser()

  // Fetch all public flows
  const fetchPublicFlows = async () => {
    publicFlowsLoading.value = true
    try {
      const flows = await getPublicFlowsFromConvex()
      publicFlows.value = flows
    } catch (error) {
      console.error('Error fetching public flows:', error)
      publicFlows.value = []
    } finally {
      publicFlowsLoading.value = false
    }
  }

  // Get community flows (public flows not created by the current user)
  const communityFlows = computed(() => {
    return publicFlows.value.filter(
      (flow) => flow.creator_id !== user_id.value
    )
  })

  // Get all public flows
  const allPublicFlows = computed(() => {
    return publicFlows.value
  })

  return {
    // State
    publicFlows: allPublicFlows,
    communityFlows,
    loading: publicFlowsLoading,

    // Functions
    fetchPublicFlows
  }
}
