import { ref, computed } from 'vue'
import { callFirebaseFunction } from '@/firebase/functions'
import { useAlert } from '@/composables/core/notification'

// Search results and state
export const flowSearchResults = ref<any[]>([])
export const flowSearchLoading = ref(false)
export const flowSearchQuery = ref('')

export const useFlowSearch = () => {
  const { openAlert } = useAlert()

  // Search flows with text query
  const searchFlows = async (
    query: string,
    options: {
      searchType?: 'name' | 'description' | 'full'
      creator_id?: string
      public_only?: boolean
      status?: number | string
      type?: string
    } = {}
  ) => {
    if (!query.trim()) {
      flowSearchResults.value = []
      return { results: [], count: 0 }
    }

    flowSearchLoading.value = true
    try {
      const result = await callFirebaseFunction('searchFlows', {
        query: query.trim(),
        searchType: options.searchType || 'full',
        creator_id: options.creator_id,
        public_only: options.public_only ?? false,
        status: options.status,
        type: options.type
      })

      flowSearchResults.value = (result as any).results || []
      return result
    } catch (error: any) {
      console.error('Flow search failed:', error)
      openAlert({
        type: 'ERROR',
        msg: `Search failed: ${error.message}`
      })
      return { results: [], count: 0 }
    } finally {
      flowSearchLoading.value = false
    }
  }

  // Get public flows using Convex (faster than Firebase)
  const getPublicFlowsFromConvex = async () => {
    flowSearchLoading.value = true
    try {
      const result = await callFirebaseFunction('getPublicFlows', {})
      return (result as any).results || []
    } catch (error: any) {
      console.error('Get public flows failed:', error)
      openAlert({
        type: 'ERROR',
        msg: `Failed to load public flows: ${error.message}`
      })
      return []
    } finally {
      flowSearchLoading.value = false
    }
  }

  // Get user's flows using Convex (with text search capability)
  const getUserFlowsFromConvex = async (creator_id?: string) => {
    flowSearchLoading.value = true
    try {
      const result = await callFirebaseFunction('getFlowsByCreator', {
        creator_id
      })
      return (result as any).results || []
    } catch (error: any) {
      console.error('Get user flows failed:', error)
      openAlert({
        type: 'ERROR',
        msg: `Failed to load flows: ${error.message}`
      })
      return []
    } finally {
      flowSearchLoading.value = false
    }
  }

  // Get a specific flow by Firebase ID (with permissions check)
  const getFlowByFirebaseId = async (firebaseId: string) => {
    try {
      const result = await callFirebaseFunction('getFlowByFirebaseId', {
        firebaseId
      })
      return (result as any).result
    } catch (error: any) {
      console.error('Get flow failed:', error)
      openAlert({
        type: 'ERROR',
        msg: `Failed to load flow: ${error.message}`
      })
      return null
    }
  }

  // Get active flows by creator
  const getActiveFlowsByCreator = async (creator_id: string) => {
    try {
      const result = await callFirebaseFunction('getActiveFlowsByCreator', {
        creator_id
      })
      return (result as any).results || []
    } catch (error: any) {
      console.error('Get active flows failed:', error)
      openAlert({
        type: 'ERROR',
        msg: `Failed to load active flows: ${error.message}`
      })
      return []
    }
  }

  // Get draft flows by creator
  const getDraftFlowsByCreator = async (creator_id: string) => {
    try {
      const result = await callFirebaseFunction('getDraftFlowsByCreator', {
        creator_id
      })
      return (result as any).results || []
    } catch (error: any) {
      console.error('Get draft flows failed:', error)
      openAlert({
        type: 'ERROR',
        msg: `Failed to load draft flows: ${error.message}`
      })
      return []
    }
  }

  // Clear search results
  const clearSearchResults = () => {
    flowSearchResults.value = []
    flowSearchQuery.value = ''
  }

  return {
    // State
    searchResults: flowSearchResults,
    searchLoading: flowSearchLoading,
    searchQuery: flowSearchQuery,

    // Functions
    searchFlows,
    getPublicFlowsFromConvex,
    getUserFlowsFromConvex,
    getFlowByFirebaseId,
    getActiveFlowsByCreator,
    getDraftFlowsByCreator,
    clearSearchResults
  }
}
