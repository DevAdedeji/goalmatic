import { ref, computed } from 'vue'

// Raw conversation data from Firebase
export const rawConversationData = ref<any>(null)

// Shared state for the messaging system
export const ai_loading = ref(false) // For message sending operations
export const history_loading = ref(false) // Specifically for loading conversation history
export const sessionId = ref<string | null>(null)

// Computed conversation history with getter and setter
export const conversationHistory = computed({
  get: () => {
    if (!rawConversationData.value || !Array.isArray(rawConversationData.value.messages)) {
      return []
    }

    // Sort messages by timestamp
    return [...rawConversationData.value.messages]
      .sort((a, b) => {
        const aTime = a.timestamp?.toDate?.() || new Date(0)
        const bTime = b.timestamp?.toDate?.() || new Date(0)
        return aTime - bTime
      })
      .map(msg => ({
        role: msg.role,
        content: msg.content,
        id: msg.id
      }))
  },
  set: (newValue) => {
    // This setter is used when manually updating the conversation history
    // It's not used for Firebase updates, which should modify rawConversationData directly
    if (!rawConversationData.value) {
      rawConversationData.value = { messages: [] }
    }

    rawConversationData.value.messages = newValue.map(msg => ({
      ...msg,
      timestamp: msg.timestamp || new Date()
    }))
  }
})
