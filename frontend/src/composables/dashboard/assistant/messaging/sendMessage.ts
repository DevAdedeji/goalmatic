import { ref } from 'vue'
import { RouteLocationNormalizedLoaded } from 'vue-router'
import { v4 as uuidv4 } from 'uuid'
import { Timestamp } from 'firebase/firestore'
import { selectedAgent } from '../agents/select'
import { ai_loading, conversationHistory, sessionId } from './state'
import { useAlert } from '@/composables/core/notification'
import { useUser } from '@/composables/auth/user'
import { callFirebaseFunction } from '@/firebase/functions'
import { setFirestoreSubDocument } from '@/firebase/firestore/create'
import { getSingleFirestoreSubDocument } from '@/firebase/firestore/fetch'
import { updateFirestoreSubDocument } from '@/firebase/firestore/edit'

// Define message type
interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Timestamp
  agent_id: string
}

export const userInput = ref<string>('')

/**
 * Sends a message to the agent and processes the response
 * @param currentRoute The current route object (optional)
 */
export const sendMessage = async (currentRoute?: RouteLocationNormalizedLoaded) => {
  if (!userInput.value.trim()) return

  const sentUserInput = userInput.value.trim()
  userInput.value = ''
  ai_loading.value = true

  // Add user message to conversation history with an ID
  conversationHistory.value.push({
    role: 'user',
    content: sentUserInput,
    id: uuidv4()
  })

  try {
    const { id: userId } = useUser()
    if (!userId.value) {
      throw new Error('User not authenticated')
    }

    if (!sessionId.value) {
      sessionId.value = uuidv4()
    }

    const sent_data = {
      history: conversationHistory.value,
      agent: selectedAgent.value,
      sessionId: sessionId.value
    }

    // Create user message object
    const userMessageId = uuidv4()
    const userMessage = {
      id: userMessageId,
      role: 'user',
      content: sentUserInput,
      timestamp: Timestamp.fromDate(new Date()),
      agent_id: selectedAgent.value.id
    }

    // Get existing chat session or create a new one
    const chatSessionRef = ref<any>(null)
    try {
      // Try to get existing chat session
      await getSingleFirestoreSubDocument('users', userId.value!, 'chatSessions', sessionId.value!, chatSessionRef)
    } catch (error) {
      // Chat session doesn't exist yet, that's okay
      console.log('Creating new chat session')
    }

    // Initialize or update the messages array
    const messages: ChatMessage[] = []
    if (chatSessionRef.value && Array.isArray(chatSessionRef.value.messages)) {
      // If chat session exists and has messages, use them
      messages.push(...chatSessionRef.value.messages)
    }

    // Add the new user message
    messages.push(userMessage as ChatMessage)

    // Create or update the chat session document with the messages
    const chatSessionData: {
      id: string | null
      agent_id: string
      updated_at: Timestamp
      messages: ChatMessage[]
      created_at?: Timestamp
    } = {
      id: sessionId.value,
      agent_id: selectedAgent.value.id,
      updated_at: Timestamp.fromDate(new Date()),
      messages
    }

    if (!chatSessionRef.value) {
      // If chat session doesn't exist, create it
      chatSessionData.created_at = Timestamp.fromDate(new Date())
      await setFirestoreSubDocument('users', userId.value!, 'chatSessions', sessionId.value!, chatSessionData)
    } else {
      await updateFirestoreSubDocument('users', userId.value!, 'chatSessions', sessionId.value!, chatSessionData)
    }

    const data = await callFirebaseFunction('messageAgent', sent_data) as any

    if (data.sessionId) {
      sessionId.value = data.sessionId
      if (currentRoute && currentRoute.path !== `/agents/${sessionId.value}`) {
        window.history.pushState({}, '', `/agents/${sessionId.value}`)
      } else if (!currentRoute) {
        window.history.pushState({}, '', `/agents/${sessionId.value}`)
      }
    }

    // Add assistant response to conversation history with an ID
    conversationHistory.value.push({
      role: 'assistant',
      content: data.response,
      id: uuidv4()
    })

    // Create assistant message object
    const assistantMessageId = uuidv4()
    const assistantMessage = {
      id: assistantMessageId,
      role: 'assistant',
      content: data.response,
      timestamp: Timestamp.fromDate(new Date()),
      agent_id: selectedAgent.value.id
    }

    // Get the updated chat session to add the assistant message
    try {
      await getSingleFirestoreSubDocument('users', userId.value!, 'chatSessions', sessionId.value!, chatSessionRef)

      // Add the assistant message to the messages array
      const updatedMessages: ChatMessage[] = []
      if (chatSessionRef.value && Array.isArray(chatSessionRef.value.messages)) {
        updatedMessages.push(...chatSessionRef.value.messages)
      }
      updatedMessages.push(assistantMessage as ChatMessage)

      // Update the chat session with the new messages
      await updateFirestoreSubDocument(
        'users',
        userId.value!,
        'chatSessions',
        sessionId.value!,
        {
          messages: updatedMessages,
          updated_at: Timestamp.fromDate(new Date())
        }
      )
    } catch (error) {
      console.error('Error updating chat session with assistant message:', error)
      throw error
    }

    ai_loading.value = false
  } catch (error) {
    ai_loading.value = false
    console.error('Error sending message:', error)
    const errorMessage = error instanceof Error ? error.message : 'Error sending message'
    useAlert().openAlert({ type: 'ERROR', msg: errorMessage })
  }
}
