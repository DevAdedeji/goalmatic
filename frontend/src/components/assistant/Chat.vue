<template>
	<section id="main1" class="flex flex-col items-center gap-4 relative h-[calc(100vh-0px)] w-full  px-4 md:pt-8 pt-4 overflow-auto pb-20">
		<section id="main2" class=" w-full md:max-w-[var(--mw)]  flex flex-col gap-6 items-start ">
			<ClientOnly>
				<div class="message-container">
					<div class="header-container">
						<div class="assistant-avatar">
							<img class="size-5" src="/og.png" alt="goalmatic logo">
						</div>

						<p class="name-label">
							Goalmatic {{ selectedAgent.id != 0 ? `(${selectedAgent.name})` : '(Default)' }}
						</p>
					</div>
					<article class="message-bubble">
						<p class="message-text">
							How can I help you today?
						</p>
					</article>
				</div>
			</ClientOnly>
			<div v-for="(message, index) in conversationHistory" :key="index"
				class="message-container"
				:class="{'!items-end': message.role === 'user'}">
				<!-- User or Assistant message -->
				<template v-if="(message.role === 'user' || message.role === 'assistant') && !message.toolId">
					<div class="header-container" :class="{ 'flex-row-reverse': message.role === 'user' }">
						<div v-if="message.role === 'user'" class="user-avatar">
							<UserAvatar :size="30" />
						</div>
						<div v-else class="assistant-avatar">
							<img class="size-5" src="/og.png" alt="goalmatic logo">
						</div>
						<p class="name-label" :class="{ 'text-right': message.role === 'user' }">
							{{ message.role === 'user' ? 'You' : `Goalmatic  ${selectedAgent.id != 0 ? `(${selectedAgent.name})` : '(Default)'}` }}
						</p>
					</div>
					<article class="message-bubble" :class="{ 'ml-0 mr-7 !bg-light !border-[#9A6BFF]': message.role === 'user' }">
						<!-- Show raw content while processing or loading animation for assistant -->
						<div v-if="isMessageProcessing(index)">
							<!-- For user messages, show raw content while processing -->
							<div v-if="message.role === 'user'" class="whitespace-pre-wrap">
								{{ message.content }}
							</div>
							<!-- For assistant messages, show loading animation -->
							<div v-else class="flex items-center gap-3 py-2">
								<span class="text-gray-600 text-sm">
									{{ ai_loading && index === conversationHistory.length - 1 ? 'Typing...' : 'Processing message...' }}
								</span>
							</div>
						</div>
						<!-- Show processed content when ready -->
						<MediaDisplay v-else :media-parts="processedMessages[index] || []" />
					</article>
				</template>


				<template v-else-if="message.toolId">
					<div class="header-container">
						<div class="assistant-avatar">
							<img class="size-5" src="/og.png" alt="goalmatic logo">
						</div>
						<p class="name-label">
							Tool Call: {{ message.toolId }}
						</p>
					</div>
					<article class="message-bubble tool-bubble">
						<div class="tool-parameters">
							<h4 class="tool-parameters-title">
								Parameters:
							</h4>
							<pre class="tool-parameters-code">{{ JSON.stringify(message.parameters, null, 2) }}</pre>
						</div>
					</article>
				</template>
			</div>

			<!-- Show typing indicator when AI is generating response but no message exists yet -->
			<div v-if="ai_loading && (conversationHistory.length === 0 || conversationHistory[conversationHistory.length - 1].role === 'user')" class="message-container">
				<div class="header-container">
					<div class="assistant-avatar">
						<img class="size-5" src="/og.png" alt="goalmatic logo">
					</div>
					<p class="name-label">
						Goalmatic {{ selectedAgent.id != 0 ? `(${selectedAgent.name})` : '(Default)' }}
					</p>
				</div>
				<article class="message-bubble">
					<div class="flex items-center gap-3 py-2">
						<span class="text-gray-600 text-sm">Thinking...</span>
					</div>
				</article>
			</div>
		</section>

		<!-- Use the MessageBox component instead of embedded form -->
		<MessageBox />
	</section>
</template>

<script setup lang="ts">
import { MoveRight } from 'lucide-vue-next'
import MediaDisplay from './MediaDisplay.vue'
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
		const main2 = document.getElementById('main2')!

    main1.scrollTo({
      top: document.documentElement.scrollHeight,
      behavior: 'smooth'
	})
	main2.scrollTo({
		top: document.documentElement.scrollHeight,
		behavior: 'smooth'
	})
  })
}, { deep: true })

// Check if a message is still being processed
const isMessageProcessing = (index: number) => {
  const message = conversationHistory.value[index]
  if (!message || message.toolId) return false

  // Check if the message exists but hasn't been processed yet
  const processedMessage = processedMessages.value[index]
  return !processedMessage || processedMessage.length === 0 ||
         (processedMessage.length === 1 && (!processedMessage[0].content || processedMessage[0].content.trim() === ''))
}
</script>

<style scoped lang="scss">
.shadow{
	box-shadow: 0px 8px 24px 0px #959DA533;
}
#main1, #main2 {
	scroll-padding: 10rem;
}
.message-container {
  @apply flex flex-col gap-2 w-full items-start;
}

.header-container {
  @apply flex gap-2 text-[#374151];
}

.user-avatar {
  @apply  flex size-[30px] shrink-0 select-none items-center justify-center rounded-full border shadow-sm;
}

.assistant-avatar {
  @apply bg-[#eaeaef] flex size-[30px] shrink-0 items-center justify-center rounded-full p-0.5;
}

.name-label {
  @apply w-full overflow-x-hidden font-semibold mt-0.5;
}

.message-bubble {
  @apply bg-[#F4F3FF] px-4 py-2 rounded-lg ml-9 w-auto border border-[#E4E7EC] md:leading-8 leading-7;
    p {
    @apply text-sm text-subText ;
  }
}


.tool-bubble {
  @apply bg-[#F5F5F5] border-[#E0E0E0];
}

.tool-parameters {
  @apply flex flex-col gap-1;
}

.tool-parameters-title {
  @apply text-sm font-semibold text-gray-700;
}

.tool-parameters-code {
  @apply text-xs bg-[#EAEAEA] p-2 rounded overflow-x-auto text-gray-800 font-mono;
}


</style>

