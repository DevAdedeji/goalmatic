import { ref, computed } from 'vue'
import { callFirebaseFunction } from '@/firebase/functions'
import { useAlert } from '@/composables/core/notification'

// Search results and state
export const searchResults = ref<any[]>([])
export const searchLoading = ref(false)
export const searchQuery = ref('')

export const useAgentSearch = () => {
  const { openAlert } = useAlert()

  // Search agents with text query
  const searchAgents = async (
    query: string,
    options: {
      searchType?: 'name' | 'description' | 'full'
      creator_id?: string
      public_only?: boolean
    } = {}
  ) => {
    if (!query.trim()) {
      searchResults.value = []
      return { results: [], count: 0 }
    }

    searchLoading.value = true
    try {
      const result = await callFirebaseFunction('searchAgents', {
        query: query.trim(),
        searchType: options.searchType || 'full',
        creator_id: options.creator_id,
        public_only: options.public_only ?? false
      })

            searchResults.value = (result as any).results || []
      return result
    } catch (error: any) {
      console.error('Search failed:', error)
      openAlert({
        type: 'ERROR',
        msg: `Search failed: ${error.message}`
      })
      return { results: [], count: 0 }
    } finally {
      searchLoading.value = false
    }
  }

  // Get public agents from backend
  const getPublicAgentsFromConvex = async () => {
    searchLoading.value = true
    try {
      const result = await callFirebaseFunction('getPublicAgents', {})
      return (result as any).results || []
    } catch (error: any) {
      console.error('Get public agents failed:', error)
      openAlert({
        type: 'ERROR',
        msg: `Failed to load public agents: ${error.message}`
      })
      return []
    } finally {
      searchLoading.value = false
    }
  }

  // Get user's agents from backend
  const getUserAgentsFromConvex = async (creator_id?: string) => {
    searchLoading.value = true
    try {
      const result = await callFirebaseFunction('getAgentsByCreator', {
        creator_id
      })
      return (result as any).results || []
    } catch (error: any) {
      console.error('Get user agents failed:', error)
      openAlert({
        type: 'ERROR',
        msg: `Failed to load agents: ${error.message}`
      })
      return []
    } finally {
      searchLoading.value = false
    }
  }

  // Get a specific agent by Firebase ID (with permissions check)
  const getAgentByFirebaseId = async (firebaseId: string) => {
    try {
      const result = await callFirebaseFunction('getAgentByFirebaseId', {
        firebaseId
      })
      return (result as any).result
    } catch (error: any) {
      console.error('Get agent failed:', error)
      openAlert({
        type: 'ERROR',
        msg: `Failed to load agent: ${error.message}`
      })
      return null
    }
  }

  // Real-time search as user types
  const performLiveSearch = async (query: string, options = {}) => {
    searchQuery.value = query
    await searchAgents(query, options)
  }

  // Clear search results
  const clearSearch = () => {
    searchResults.value = []
    searchQuery.value = ''
  }

  // Check if search has results
  const hasResults = computed(() => searchResults.value.length > 0)
  const isEmpty = computed(() => !searchLoading.value && searchResults.value.length === 0 && searchQuery.value.trim() !== '')

  return {
    // State
    searchResults,
    searchLoading,
    searchQuery,
    hasResults,
    isEmpty,

    // Functions
    searchAgents,
    getPublicAgentsFromConvex,
    getUserAgentsFromConvex,
    getAgentByFirebaseId,
    performLiveSearch,
    clearSearch
  }
}
