<template>
	<div class="message-box ">
		<form class="relative w-full md:max-w-[var(--mw)] flex flex-wrap mt-auto message-box-area input-field" @submit.prevent="sendMessage">
			<textarea ref="textarea" v-model="userInput" class="input border-none !bg-transparent" placeholder="Tell your agent what to do..."
				@input="adjustTextareaHeight" @keydown="handleKeyDown" />

			<div class="flex justify-between items-center  w-full ">
				<AssistantDropDown class="" :selected-agent="selectedAgent" />
				<button
					:disabled="!userInput || ai_loading"
					class="flex p-[10px] text-white flex-col justify-center items-center gap-[10px] rounded-[6px] bg-primary disabled:opacity-70 disabled:cursor-not-allowed"
					type="submit"
				>
					<MoveRight v-if="!ai_loading" :stroke-width="2.5" :size="16" />
					<Spinner v-else size="14px" />
				</button>
			</div>
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


const props = defineProps<{
	selectedAgent: Record<string, any>
}>()

// Template ref for textarea
const textarea = ref()



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
.message-box {
	@apply fixed md:w-[800px] w-[94%] mx-auto bottom-24  md:bottom-4 md:p-4 p-2;
	display: flex;
flex-direction: column;
justify-content: center;
align-items: flex-start;
gap: 16px;
border-radius: 16px;
background: #F1F5F8;
}
.message-box-area textarea {
	@apply resize-none overflow-hidden h-auto p-0  transition-all duration-300 ease-in-out  w-full ;
}
.message-box-area {
	@apply md:p-4;
	display: flex;
flex-direction: column;
justify-content: center;
align-items: flex-start;
align-self: stretch;
border-radius: 12px;
border: 0.8px solid #D6E0EB;
background: var(--Form-Fill-Fill, #FCFCFD);
box-shadow: 0px 30px 2px -30px rgba(0, 0, 0, 0.15);
}
</style>
