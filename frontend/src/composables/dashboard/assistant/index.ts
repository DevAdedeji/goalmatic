import { v4 as uuidv4 } from 'uuid'
import { selectedAgent } from './agents/select'
import { useAlert } from '@/composables/core/notification'
import { callFirebaseFunction } from '@/firebase/functions'

const conversationHistory = ref([] as any)
const ai_loading = ref(false)
const sessionId = ref<string | null>(null)

export const useChatAssistant = () => {
  const userInput = ref<string>('')
  const route = useRoute()




  // Watch for route path changes to clear history when navigating to /agents
  watch(() => route.path, (newPath) => {
    if (newPath === '/agents') {
      // Clear conversation history when navigating to the main agents page
      conversationHistory.value = []
      sessionId.value = null
      console.log('Cleared conversation history - navigated to /agents')
    }
  }, { immediate: true })

  // Define the URL change handler function
  const handleUrlChange = ((event: CustomEvent) => {
    if (event.detail?.path === '/agents') {
      conversationHistory.value = []
      sessionId.value = null
    }
  }) as EventListener


  onMounted(() => {
    window.addEventListener('url-changed', handleUrlChange)
  })

  onUnmounted(() => {
    window.removeEventListener('url-changed', handleUrlChange)
  })

  // Load conversation history for a specific sessionId
  const loadConversationHistory = async (sid: string) => {
    try {
      ai_loading.value = true
      // Clear existing conversation history
      conversationHistory.value = []

      // Check if this is our specific demo session ID
      if (sid === 'c2d646c7-ff7e-420b-a4de-22cc6a68a05d') {
        // Load mock conversation history for the demo session
        conversationHistory.value = [
          {
            role: 'user',
            content: 'Hello, can you help me with a task?'
          },
          {
            role: 'assistant',
            content: 'Of course! I\'d be happy to help. What kind of task do you need assistance with?'
          },
          {
            role: 'user',
            content: 'I need to create a data visualization for my project'
          },
          {
            role: 'assistant',
            content: 'I can definitely help with that. What kind of data are you working with, and what type of visualization would you like to create?'
          }
        ]
        console.log(`Loaded demo conversation for session: ${sid}`)
      } else {
        // In a real implementation, you would fetch the conversation history from your backend
        // using the sid parameter
        console.log(`Loading conversation history for session: ${sid}`)

        // For other session IDs, just add a placeholder message
        conversationHistory.value = [
          {
            role: 'assistant',
            content: 'Previous conversation loaded. How can I help you further?'
          }
        ]
      }

      ai_loading.value = false
    } catch (error) {
      ai_loading.value = false
      console.error('Error loading conversation history:', error)
      const errorMessage = error instanceof Error ? error.message : 'Error loading conversation history'
      useAlert().openAlert({ type: 'ERROR', msg: errorMessage })
    }
  }

  const sendMessage = async () => {
    if (!userInput.value.trim()) return

    const sentUserInput = userInput.value.trim()
    userInput.value = ''
    ai_loading.value = true

    conversationHistory.value.push({
      role: 'user',
      content: sentUserInput
    })

    try {
      // Generate a new sessionId if we don't have one yet
      if (!sessionId.value) {
        sessionId.value = uuidv4()
      }

      const sent_data = {
        history: conversationHistory.value,
        agent: selectedAgent.value,
        sessionId: sessionId.value
      }

      const data = await callFirebaseFunction('messageAgent', sent_data) as any

      if (data.sessionId) {
        // If we get a sessionId from the backend, use it
        sessionId.value = data.sessionId

        // Update the URL with the sessionId if we're not already on that route
        if (route.path !== `/agents/${sessionId.value}`) {
          // Use the History API to update the URL without refreshing the page
          window.history.pushState({}, '', `/agents/${sessionId.value}`)
        }
      }

      conversationHistory.value.push({
        role: 'assistant',
        content: data.response
      })

      ai_loading.value = false
    } catch (error) {
      ai_loading.value = false
      console.error('Error sending message:', error)
      const errorMessage = error instanceof Error ? error.message : 'Error sending message'
      useAlert().openAlert({ type: 'ERROR', msg: errorMessage })
    }
  }



  return {
    userInput,
    conversationHistory,
    sendMessage,
    ai_loading,
    sessionId,
    loadConversationHistory
  }
}

