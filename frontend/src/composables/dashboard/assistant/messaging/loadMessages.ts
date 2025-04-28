import { ai_loading, history_loading, sessionId, rawConversationData } from './state'
import { useAlert } from '@/composables/core/notification'
import { useUser } from '@/composables/auth/user'
import { getSingleFirestoreSubDocument } from '@/firebase/firestore/fetch'

/**
 * Loads conversation history for a specific session ID
 * @returns boolean indicating if the session was found and loaded successfully
 */
export const loadConversationHistory = async (sid: string): Promise<boolean> => {
  try {
    // Set both loading states to true
    history_loading.value = true
    ai_loading.value = true
    sessionId.value = sid

    const { id: userId } = useUser()
    if (!userId.value) {
      history_loading.value = false
      ai_loading.value = false
      throw new Error('User not authenticated')
    }

    // Fetch the chat session document directly into rawConversationData
    await getSingleFirestoreSubDocument('users', userId.value, 'chatSessions', sid, rawConversationData)

    // If chat session was found and has messages
    if (rawConversationData.value && Array.isArray(rawConversationData.value.messages) && rawConversationData.value.messages.length > 0) {
      history_loading.value = false
      ai_loading.value = false
      return true
    } else {
      // No messages found for this session ID
      rawConversationData.value = { messages: [] }
      history_loading.value = false
      ai_loading.value = false
      useAlert().openAlert({
        type: 'Alert',
        msg: 'No chat history found for this session. Please start a new chat.'
      })
      return false
    }
  } catch (error) {
    // Make sure to reset both loading states on error
    history_loading.value = false
    ai_loading.value = false
    console.error('Error loading conversation history:', error)
    const errorMessage = error instanceof Error ? error.message : 'Error loading conversation history'
    useAlert().openAlert({ type: 'ERROR', msg: errorMessage })
    return false
  }
}

/**
 * Handles URL changes to reset conversation when navigating to /agents
 */
export const handleUrlChange = ((event: CustomEvent) => {
  if (event.detail?.path === '/agents') {
    rawConversationData.value = { messages: [] }
    sessionId.value = null
  }
}) as EventListener
