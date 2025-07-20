<template>
	<section id="main1" class="flex flex-col items-center gap-4 relative h-[calc(100vh-140px)] w-full px-4 md:pt-8 pt-4 overflow-y-auto">
		<section id="main2" class="w-full md:max-w-[var(--mw)] flex flex-col gap-6 items-start">
			<div v-if="!conversationHistory.length" class="flex flex-col items-center justify-center absolute w-full md:top-[40%] top-[30%] left-[50%] translate-x-[-50%]">
				<img class="size-7" src="/og.png" alt="goalmatic logo">
				<p class="text-xl font-bold mt-4 max-w-[220px] text-center">
					{{ selectedAgent.name }}
				</p>
				<p class="mt-2 text-sm text-subText max-w-[300px] text-center">
					{{ selectedAgent.description }}
				</p>
			</div>

			<ChatList :conversation-history="conversationHistory" :ai_loading="ai_loading" :selected-agent="selectedAgent" />

			<!-- Add padding at the bottom to ensure content is visible above MessageBox -->
			<div class="h-32" />
		</section>

		<!-- Use the MessageBox component instead of embedded form -->
		<MessageBox :selected-agent="selectedAgent" />
	</section>
</template>

<script setup lang="ts">
import ChatList from './ChatList.vue'
import MessageBox from './MessageBox.vue'
import { useChatAssistant } from '@/composables/dashboard/assistant/messaging'
import { useOnAssistantLoad } from '@/composables/dashboard/assistant/agents/select'
import { processMessageMedia, type MediaContent } from '@/composables/assistant/mediaProcessor'

// Add Material Icons for tool call icons
useHead({
  link: [
    {
      rel: 'stylesheet',
      href: 'https://fonts.googleapis.com/icon?family=Material+Icons'
    }
  ]
})

const { fetchSelectedAgent, selectedAgent } = useOnAssistantLoad()
fetchSelectedAgent()


const { conversationHistory, ai_loading, sessionId, loadConversationHistory, handleUrlChange } = useChatAssistant()

// Reactive processing of messages for media content
const processedMessages = ref<MediaContent[][]>([])

// Process messages when conversation history changes
watch(conversationHistory, async () => {
  const processed: MediaContent[][] = []

  for (const message of conversationHistory.value) {
    if ((message.role === 'user' || message.role === 'assistant') && !message.toolId) {
      try {
        const mediaParts = await processMessageMedia(message.content)
        processed.push(mediaParts)
      } catch (error) {
        console.error('Failed to process message media:', error)
        // Fallback to showing original content as text
        processed.push([{
          type: 'text',
          content: message.content
        }])
      }
    } else {
      processed.push([])
    }
  }

  processedMessages.value = processed
}, { immediate: true, deep: true })

watch(() => useRoute().params.sessionId, (newSessionId) => {
  if (newSessionId && typeof newSessionId === 'string' && newSessionId !== sessionId.value) {
    sessionId.value = newSessionId
    loadConversationHistory(sessionId.value)
  } else {
    conversationHistory.value = []
    sessionId.value = null
  }
}, { immediate: true })

onMounted(() => {
  window.addEventListener('url-changed', handleUrlChange)
})

onUnmounted(() => {
  window.removeEventListener('url-changed', handleUrlChange)
})

watch(conversationHistory, () => {
	nextTick(() => {
		const main1 = document.getElementById('main1')!

		main1.scrollTo({
			top: main1.scrollHeight,
			behavior: 'smooth'
		})
	})
}, { deep: true })

// Check if a message is still being processed
const isMessageProcessing = (index: number) => {
	const message = conversationHistory.value[index]
  if (!message || message.toolId || message.role === 'user' || message.role === 'assistant') return false

  // Check if the message exists but hasn't been processed yet
  const processedMessage = processedMessages.value[index]
  return !processedMessage || processedMessage.length === 0 ||
         (processedMessage.length === 1 && (!processedMessage[0].content || processedMessage[0].content.trim() === ''))
}
</script>

<style scoped lang="scss">
#main1 {
	scroll-padding-bottom: 8rem;
}



</style>

