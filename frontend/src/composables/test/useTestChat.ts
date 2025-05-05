import { ref } from 'vue'
import { v4 as uuidv4 } from 'uuid'

// State
export const userInput = ref<string>('')
export const conversationHistory = ref<any[]>([])
export const sessionId = ref<string | null>(null)
export const isLoading = ref<boolean>(false)

/**
 * Composable for test chat functionality
 */
export const useTestChat = () => {
  const route = useRoute()
  const router = useRouter()

  /**
   * Sends a message to the server and processes the response
   */
  const sendMessage = async () => {
    if (!userInput.value.trim()) return

    const sentUserInput = userInput.value.trim()
    userInput.value = ''
    isLoading.value = true

    // Add user message to conversation history
    conversationHistory.value.push({
      role: 'user',
      content: sentUserInput,
      id: uuidv4()
    })

    try {
      // Call the Nuxt server function
      const { data, error } = await useFetch('/api/chat', {
        method: 'POST',
        body: {
          message: sentUserInput,
          history: conversationHistory.value,
          sessionId: sessionId.value
        }
      })

      if (error.value) {
        throw new Error(error.value.message || 'Error sending message')
      }

      if (data.value) {
        // Define the expected response type
        interface ChatResponse {
          response: string;
          sessionId: string;
          metadata: {
            processingTime: number;
          };
        }

        // Cast data.value to the expected type
        const response = data.value as ChatResponse

        // Update session ID if provided
        if (response.sessionId) {
          sessionId.value = response.sessionId

          // Update URL with session ID
          if (route.path !== `/test/${sessionId.value}`) {
            window.history.pushState({}, '', `/test/${sessionId.value}`)
          }
        }

        // Add assistant response to conversation history
        conversationHistory.value.push({
          role: 'assistant',
          content: response.response,
          id: uuidv4(),
          metadata: response.metadata
        })
      }
    } catch (error) {
      console.error('Error sending message:', error)
      // You could add error handling UI here
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Loads conversation history for a specific session ID
   */
  const loadConversationHistory = async (sid: string): Promise<boolean> => {
    try {
      isLoading.value = true
      sessionId.value = sid

      // In a real implementation, you would fetch the conversation history from the server
      // For this example, we'll just set the session ID

      // Simulate a delay
      await new Promise((resolve) => setTimeout(resolve, 500))

      isLoading.value = false
      return true
    } catch (error) {
      console.error('Error loading conversation history:', error)
      isLoading.value = false
      return false
    }
  }

  /**
   * Starts a new chat session
   */
  const startNewChat = () => {
    conversationHistory.value = []
    sessionId.value = null
    router.push('/test')
  }

  /**
   * Handles URL changes
   */
  const handleUrlChange = () => {
    const path = window.location.pathname
    if (path.startsWith('/test/')) {
      const pathSessionId = path.split('/').pop()
      if (pathSessionId && pathSessionId !== sessionId.value) {
        loadConversationHistory(pathSessionId)
      }
    }
  }

  return {
    userInput,
    conversationHistory,
    sendMessage,
    isLoading,
    sessionId,
    loadConversationHistory,
    startNewChat,
    handleUrlChange
  }
}
