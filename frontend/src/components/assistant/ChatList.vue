<template>
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
					<img class="size-5" :src="selectedAgent.avatar || '/og.png'" alt="goalmatic logo">
				</div>
				<p class="name-label" :class="{ 'text-right': message.role === 'user' }">
					{{ message.role === 'user' ? 'You' : `Goalmatic  ${selectedAgent.id != 0 ? `(${selectedAgent.name})` : '(Default)'}` }}
				</p>
			</div>
			<article class="message-bubble" :class="{ 'ml-0 mr-7 !bg-light !border-[#9A6BFF]': message.role === 'user' }">
				<div v-html="markdownProcessor(message.content)" />

				<!-- <MediaDisplay v-else :media-parts="processedMessages[index] || []" /> -->
			</article>
		</template>


		<template v-else-if="message.toolId">
			<div class="header-container">
				<div class="assistant-avatar">
					<img class="size-5" :src="selectedAgent.avatar || '/og.png'" alt="goalmatic logo">
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
				<img class="size-5" :src="selectedAgent.avatar || '/og.png'" alt="goalmatic logo">
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
</template>

<script setup lang="ts">
import MediaDisplay from './MediaDisplay.vue'
import { markdownProcessor } from '@/composables/utils/markdown'

defineProps<{
	conversationHistory: any[]
	ai_loading: boolean
	selectedAgent: any
}>()
</script>

<style scoped lang="scss">
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
    span {
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
