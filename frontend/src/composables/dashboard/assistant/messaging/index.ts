import { useRoute, useRouter } from 'vue-router'
import { watch, onMounted } from 'vue'
import { userInput, sendMessage as originalSendMessage } from './sendMessage'
import { loadConversationHistory, handleUrlChange } from './loadMessages'
import { conversationHistory, ai_loading, history_loading, sessionId, rawConversationData } from './state'

/**
 * Composable for chat assistant functionality
 */
export const useChatAssistant = () => {
  const route = useRoute()
  const router = useRouter()

  // Wrap the sendMessage function to pass the current route
  const sendMessage = () => originalSendMessage(route)

  // Reset conversation when navigating to /agents
  watch(() => route.path, (newPath) => {
    if (newPath === '/agents') {
      rawConversationData.value = { messages: [] }
      sessionId.value = null
    }
  }, { immediate: true })

  // Check for session ID in URL and load conversation
  onMounted(async () => {
    // If we're on a specific session page
    if (route.path.startsWith('/agents/') && route.path !== '/agents/list') {
      const pathSessionId = route.path.split('/').pop()

      if (pathSessionId) {
        // Try to load the conversation history
        const success = await loadConversationHistory(pathSessionId)

        // If no messages were found, redirect to the main agents page
        if (!success) {
          router.push('/agents')
        }
      }
    }
  })

  /**
   * Starts a new chat session
   */
  const startNewChat = () => {
    rawConversationData.value = { messages: [] }
    sessionId.value = null
    router.push('/agents')
  }

  return {
    handleUrlChange,
    userInput,
    conversationHistory,
    sendMessage,
    ai_loading,
    history_loading, // Expose the history loading state
    sessionId,
    loadConversationHistory,
    startNewChat
  }
}
