<template>
	<Modal
		modal="$atts.modal"
		title="Create Agent"
		:props-modal="propsModal"
		modal-content-class="p-0 "
	>
		<template #header>
			<div class="flex flex-col relative w-full">
				<h2 class="text-lg font-semibold">
					Personalize your new Agent
				</h2>
				<p class="text-sm text-[#535862]">
					Add a name and description to your agent.
				</p>

				<button class="absolute top-0 right-0 " type="button" @click="closeCreateAgent">
					<X class="size-6" />
				</button>
			</div>
		</template>
		<form class="flex flex-col " @submit.prevent="createAgent()">
			<div class="p-2.5">
				<section class="flex flex-col p-2.5 gap-4  bg-[#F9FAFB] rounded-[10px]">
					<!-- Avatar Selection -->
					<AvatarSelector
						:selected-avatar="createAgentForm.avatar"
						@update:avatar="createAgentForm.avatar = $event"
					/>

					<div class="field relative mt-6">
						<label for="name">Agent Name</label>
						<input v-model="createAgentForm.name" required class="input-field" placeholder="Enter Agent Name">
					</div>
					<div class="field relative">
						<label for="name">Description</label>
						<textarea v-model="createAgentForm.description" class="input-textarea" rows="4" placeholder="What does this agent do?" />
					</div>
				</section>
			</div>

			<footer class="flex gap-3 w-full p-5  bg-[#F5F7F9] rounded-b-2xl z-10">
				<button class="btn-outline bg-light flex-1" type="button" :disabled="loading" @click="closeCreateAgent">
					Cancel
				</button>
				<button class="btn-primary flex-1" :disabled="isDisabled || loading">
					<span v-if="!loading"> Create </span>
					<Spinner v-else />
				</button>
			</footer>
		</form>
	</Modal>
</template>

<script setup lang="ts">
import { X } from 'lucide-vue-next'
import AvatarSelector from './AvatarSelector.vue'
import { useAssistantModal } from '@/composables/core/modals'
import { useCreateAgent } from '@/composables/dashboard/assistant/agents/create'

const { closeCreateAgent } = useAssistantModal()
const { createAgent, loading, createAgentForm, isDisabled } = useCreateAgent()

defineProps({
	payload: {
		type: Object as PropType<Record<string, any> | null>,
		default: null,
		required: false
	},
	propsModal: {
		type: String,
		required: false
	}
})
</script>

<style>

</style>
