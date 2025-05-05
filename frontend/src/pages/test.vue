<template>
	<section id="main1" class="flex flex-col items-center gap-4 relative h-[calc(100vh-0px)] w-full px-4 md:pt-8 pt-4 overflow-auto pb-20">
		<section id="main2" class="w-full md:max-w-[var(--mw)] flex flex-col gap-6 items-start">
			<div class="message-container">
				<div class="header-container">
					<div class="assistant-avatar">
						<img class="size-5" src="/og.png" alt="goalmatic logo">
					</div>
					<p class="name-label">
						Test Chat
					</p>
				</div>
				<article class="message-bubble">
					<p class="message-text">
						How can I help you today?
					</p>
				</article>
			</div>
			<div v-for="(message, index) in conversationHistory" :key="index"
				class="message-container"
				:class="{'!items-end': message.role === 'user'}">
				<!-- User or Assistant message -->
				<div class="header-container" :class="{ 'flex-row-reverse': message.role === 'user' }">
					<div v-if="message.role === 'user'" class="user-avatar">
						<TestUserAvatar :size="30" />
					</div>
					<div v-else class="assistant-avatar">
						<img class="size-5" src="/og.png" alt="goalmatic logo">
					</div>
					<p class="name-label" :class="{ 'text-right': message.role === 'user' }">
						{{ message.role === 'user' ? 'You' : 'Test Chat' }}
					</p>
				</div>
				<article class="message-bubble" :class="{ 'ml-0 mr-7 !bg-light !border-[#9A6BFF]': message.role === 'user' }">
					<div v-if="message.role === 'user'">
						{{ message.content }}
					</div>
					<div v-else v-html="message.content" />

					<div v-if="message.metadata && message.role === 'assistant'" class="metadata-container">
						<div class="metadata-header" @click="toggleMetadata(message.id)">
							<span>View Metadata</span>
							<ChevronDown :class="{'rotate-180': expandedMetadata === message.id}" class="size-4 transition-transform" />
						</div>
						<div v-if="expandedMetadata === message.id" class="metadata-content">
							<div class="metadata-item">
								<span class="metadata-label">Processing Time:</span>
								<span>{{ message.metadata.processingTime }}ms</span>
							</div>
						</div>
					</div>
				</article>
			</div>
		</section>

		<div class="fixed bg-white pt-2.5 px-3 center z-20 md:w-[800px] w-full mx-auto bottom-20 md:bottom-4">
			<form class="relative w-full md:max-w-[var(--mw)] flex flex-wrap mt-auto" @submit.prevent="sendMessage">
				<textarea ref="textarea" v-model="userInput" class="input-field shadow !pb-4 !pt-4 !pr-16 w-full resize-none overflow-hidden h-auto transition-all duration-300 ease-in-out" placeholder="How can I help you?" rows="1" @input="adjustTextareaHeight"
					@keydown="handleKeyDown" />

				<button
					:disabled="!userInput || isLoading"
					class="absolute bottom-2.5 right-4 disabled:opacity-50 disabled:cursor-not-allowed px-4 py-2 md:py-2.5 rounded-lg bg-primary text-white text-sm center gap-2 border border-white font-semibold button_shadow"
					type="submit"
				>
					<MoveRight v-if="!isLoading" :stroke-width="2.5" :size="14" class="-rotate-90" />
					<Spinner v-else size="14px" />
				</button>
			</form>
		</div>
	</section>
</template>

<script setup lang="ts">
import { MoveRight, ChevronDown } from 'lucide-vue-next'
import { useTestChat } from '@/composables/test/useTestChat'
import TestUserAvatar from '@/components/test/TestUserAvatar.vue'
import Spinner from '@/components/core/Spinner.vue'

const { userInput, conversationHistory, sendMessage, isLoading, sessionId, loadConversationHistory, handleUrlChange } = useTestChat()
const textarea = ref()
const expandedMetadata = ref<string | null>(null)

const toggleMetadata = (messageId: string) => {
  if (expandedMetadata.value === messageId) {
    expandedMetadata.value = null
  } else {
    expandedMetadata.value = messageId
  }
}

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

const adjustTextareaHeight = () => {
	setTimeout(() => {
		if (textarea.value) {
			textarea.value.style.height = 'auto'
			textarea.value.style.height = textarea.value.scrollHeight + 'px'
		}
	}, 100)
}

const handleKeyDown = (event: KeyboardEvent) => {
	if (event.key === 'Enter' && !event.shiftKey) {
		event.preventDefault()
		sendMessage()
	}
}

watch(userInput, () => {
	adjustTextareaHeight()
}, { deep: true, immediate: true })

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
</script>

<style scoped>
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
	@apply flex size-[30px] shrink-0 select-none items-center justify-center rounded-full border shadow-sm;
}

.assistant-avatar {
	@apply bg-[#eaeaef] flex size-[30px] shrink-0 items-center justify-center rounded-full p-0.5;
}

.name-label {
	@apply w-full overflow-x-hidden font-semibold mt-0.5;
}

.message-bubble {
	@apply bg-[#F4F3FF] px-4 py-2 rounded-lg ml-9 w-auto border border-[#E4E7EC] md:leading-8 leading-7 text-sm text-subText;
}

.metadata-container {
	@apply mt-3 border-t border-gray-200 pt-2;
}

.metadata-header {
	@apply flex items-center justify-between cursor-pointer text-xs font-medium text-primary hover:text-primary;
}

.metadata-content {
	@apply mt-2 bg-gray-50 p-2 rounded text-xs;
}

.metadata-item {
	@apply mb-1 flex flex-col;
}

.metadata-label {
	@apply font-semibold text-gray-700;
}
</style>
