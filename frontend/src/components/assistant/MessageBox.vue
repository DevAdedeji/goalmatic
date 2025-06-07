<template>
	<div class="fixed  bg-white pt-2.5 px-3 center z-20 md:w-[800px] w-full mx-auto bottom-20  md:bottom-4 ">
		<form class="relative w-full md:max-w-[var(--mw)] flex flex-wrap mt-auto" @submit.prevent="sendMessage">
			<AssistantDropDown class="-top-1.5 absolute" :selected-agent="selectedAgent" />
			<textarea ref="textarea" v-model="userInput" class="input-field  shadow !pb-4 !pt-4 !pr-16 w-full resize-none overflow-hidden h-auto  transition-all duration-300 ease-in-out" placeholder="How can I help you?" rows="1" @input="adjustTextareaHeight"
				@keydown="handleKeyDown" />

			<button
				:disabled="!userInput || ai_loading"
				class="absolute bottom-2.5 right-4 disabled:opacity-50 disabled:cursor-not-allowed px-4 py-2 md:py-2.5 rounded-lg bg-primary text-white text-sm center gap-2 border border-white font-semibold button_shadow"
				type="submit"
			>
				<MoveRight v-if="!ai_loading" :stroke-width="2.5" :size="14" class="-rotate-90" />
				<Spinner v-else size="14px" />
			</button>
		</form>
	</div>
</template>

<script setup lang="ts">
import { MoveRight } from 'lucide-vue-next'
import AssistantDropDown from './DropDown.vue'
import Spinner from '@/components/core/Spinner.vue'
import { useChatAssistant } from '@/composables/dashboard/assistant/messaging'
import { useOnAssistantLoad } from '@/composables/dashboard/assistant/agents/select'

// Get the selected agent and assistant functionality
const { fetchSelectedAgent, selectedAgent } = useOnAssistantLoad()
const { userInput, sendMessage, ai_loading } = useChatAssistant()

// Template ref for textarea
const textarea = ref()

// Fetch the selected agent on component mount
fetchSelectedAgent()

// Function to adjust textarea height based on content
const adjustTextareaHeight = () => {
	setTimeout(() => {
		if (textarea.value) {
			textarea.value.style.height = 'auto'
			textarea.value.style.height = textarea.value.scrollHeight + 'px'
		}
	}, 100)
}

// Handle key down events for sending messages
const handleKeyDown = (event: KeyboardEvent) => {
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault()
    sendMessage()
  }
}

// Watch for changes in user input to adjust textarea height
watch(userInput, () => {
  adjustTextareaHeight()
}, { deep: true, immediate: true })
</script>

<style scoped>
.shadow {
	box-shadow: 0px 8px 24px 0px #959DA533;
}
</style>
