import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useUser } from '@/composables/auth/user'
import { useAlert } from '@/composables/core/notification'
import { useConfirmationModal } from '@/composables/core/confirmation'
import { getFirestoreSubCollection } from '@/firebase/firestore/fetch'
import { callFirebaseFunction } from '@/firebase/functions'
import { useFetchAgents, useFetchUserAgents, defaultGoalmaticAgent } from '@/composables/dashboard/assistant/agents/fetch'

// Types for chat sessions
export interface ChatSession {
  id: string
  agent_id: string
  created_at: any
  updated_at: any
  messages: any[]
  summary?: string
  shortId?: string
}

// Reactive state for chat sessions
const chatSessions = ref<ChatSession[]>([])
const loading = ref(false)

// Agent data for name resolution
const { fetchedAllAgents, fetchAllAgents } = useFetchAgents()
const { fetchedUserAgents, fetchUserAgents } = useFetchUserAgents()
const agentsLoaded = ref(false)

/**
 * Composable for managing chat history
 */
export const useChatHistory = () => {
  const { id: userId } = useUser()
  const router = useRouter()

  /**
   * Fetch all agents (both public and user agents) for name resolution
   */
  const loadAgentsForNameResolution = async () => {
    if (agentsLoaded.value) return

    try {
      await Promise.all([
        fetchAllAgents(),
        fetchUserAgents()
      ])
      agentsLoaded.value = true
    } catch (error) {
      console.error('Error loading agents for name resolution:', error)
    }
  }

  /**
   * Fetches all chat sessions for the current user
   */
  const fetchChatSessions = async () => {
    if (!userId.value) {
      useAlert().openAlert({
        type: 'ERROR',
        msg: 'User not authenticated'
      })
      return
    }

    try {
      loading.value = true
      chatSessions.value = [] // Clear existing sessions

      // Load agents for name resolution and fetch chat sessions in parallel
      await Promise.all([
        loadAgentsForNameResolution(),
        getFirestoreSubCollection(
          'users',
          userId.value,
          'chatSessions',
          chatSessions
        )
      ])

      loading.value = false
    } catch (error) {
      loading.value = false
      console.error('Error fetching chat sessions:', error)
      useAlert().openAlert({
        type: 'ERROR',
        msg: 'Failed to load chat history'
      })
    }
  }

  /**
   * Computed property to get sorted chat sessions (most recent first)
   */
  const sortedChatSessions = computed(() => {
    return [...chatSessions.value]
      .filter((session) => session.messages && session.messages.length > 0) // Only show sessions with messages
      .sort((a, b) => {
        const aTime = a.updated_at?.toDate?.() || new Date(0)
        const bTime = b.updated_at?.toDate?.() || new Date(0)
        return bTime - aTime // Most recent first
      })
  })

  /**
   * Navigate to a specific chat session
   */
  const navigateToSession = (sessionId: string) => {
    router.push(`/agents/${sessionId}`)
  }

  /**
   * Get a display summary for a chat session
   */
  const getSessionSummary = (session: ChatSession): string => {
    if (session.summary) {
      return session.summary
    }

    // Fallback: get first user message
    const firstUserMessage = session.messages?.find((msg) => msg.role === 'user')
    if (firstUserMessage?.content) {
      const content = typeof firstUserMessage.content === 'string'
        ? firstUserMessage.content
        : 'Media message'
      return content.length > 50 ? content.substring(0, 50) + '...' : content
    }

    return 'New Chat'
  }

  /**
   * Get a display name for the agent used in the session
   */
  const getAgentDisplayName = (session: ChatSession): string => {
    // Handle default agent
    if (session.agent_id === '0' || String(session.agent_id) === '0') {
      return defaultGoalmaticAgent.name
    }

    // Combine all available agents (public + user agents)
    const allAgents = [
      defaultGoalmaticAgent,
      ...fetchedAllAgents.value,
      ...fetchedUserAgents.value
    ]

    // Find the agent by ID
    const agent = allAgents.find((agent) => agent.id === session.agent_id)

    if (agent) {
      return agent.name
    }

    // Fallback for non-available agents
    return 'Agent Not Available'
  }

  /**
   * Format the session date for display
   */
  const formatSessionDate = (session: ChatSession): string => {
    const date = session.updated_at?.toDate?.() || new Date()
    const now = new Date()
    const diffTime = Math.abs(now.getTime() - date.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays === 1) {
      return 'Today'
    } else if (diffDays === 2) {
      return 'Yesterday'
    } else if (diffDays <= 7) {
      return `${diffDays - 1} days ago`
    } else {
      return date.toLocaleDateString()
    }
  }


  const deleteChatSessionLoading = ref(false)
  const deleteChatSession = async (sessionId: string) => {
    if (!userId.value) {
      useAlert().openAlert({
        type: 'ERROR',
        msg: 'User not authenticated'
      })
      return
    }

    try {
      deleteChatSessionLoading.value = true
      const result = await callFirebaseFunction('deleteChatSession', { sessionId }) as {
        success: boolean
        deletedFiles: number
        message: string
      }

      if (result.success) {
        // Remove the session from local state
        chatSessions.value = chatSessions.value.filter((session) => session.id !== sessionId)

        useAlert().openAlert({
          type: 'SUCCESS',
          msg: `Chat deleted successfully${result.deletedFiles > 0 ? ` (${result.deletedFiles} files removed)` : ''}`
        })

        // If we're currently viewing the deleted session, redirect to main agents page
        if (router.currentRoute.value.path === `/agents/${sessionId}`) {
          router.push('/agents')
        }
      }
    } catch (error) {
      console.error('Error deleting chat session:', error)
      useAlert().openAlert({
        type: 'ERROR',
        msg: 'Failed to delete chat session'
      })
    } finally {
      deleteChatSessionLoading.value = false
    }
  }

  /**
   * Show confirmation dialog before deleting a chat session
   */
  const confirmDeleteSession = async (session: ChatSession) => {
    const sessionSummary = getSessionSummary(session)
    const displayTitle = sessionSummary.length > 30 ? sessionSummary.substring(0, 30) + '...' : sessionSummary

    useConfirmationModal().openAlert({
      type: 'Alert',
      title: 'Delete Chat',
      desc: `Are you sure you want to delete "${displayTitle}"? This action cannot be undone and will also remove any associated media files.`,
      call_function: async () => {
        await deleteChatSession(session.id)
        useConfirmationModal().closeAlert()
      },
      loading: deleteChatSessionLoading
    })
  }

  return {
    chatSessions,
    loading,
    sortedChatSessions,
    fetchChatSessions,
    navigateToSession,
    getSessionSummary,
    getAgentDisplayName,
    formatSessionDate,
    deleteChatSession,
    confirmDeleteSession,
    loadAgentsForNameResolution
  }
}
