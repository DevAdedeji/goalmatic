<template>
	<Modal
		modal="$atts.modal"
		title="Create Workflow"
		:is-full-height="false"
		:props-modal="propsModal"
		modal-content-class="p-0 "
		size="xl"
	>
		<template #header>
			<div class="flex flex-col relative w-full">
				<h2 class="text-lg font-semibold">
					Create a new workflow
				</h2>
				<p class="text-sm text-[#535862]">
					Give your workflow a name and description
				</p>

				<button class="absolute top-0 right-0 " type="button" @click="closeCreateWorkflow">
					<X class="size-6" />
				</button>
			</div>
		</template>
		<form class="flex flex-col " @submit.prevent="createWorkflowModal()">
			<div class="p-2.5">
				<section class="flex flex-col p-2.5 gap-4  bg-[#F9FAFB] rounded-[10px]">
					<div class="field relative mt-6">
						<label for="name">Workflow Name</label>
						<input
							v-model="createFlowForm.name"
							required
							class="input-field"
							placeholder="Give your workflow a name"
						>
					</div>
					<div class="field relative">
						<label for="description">Workflow Description</label>
						<textarea
							v-model="createFlowForm.description"
							class="input-textarea"
							rows="4"
							placeholder="Describe what this workflow does"
						/>
					</div>
				</section>
			</div>

			<footer class="flex gap-3 w-full p-5  bg-[#F5F7F9] rounded-b-2xl z-10">
				<button class="btn-outline bg-light flex-1" type="button" :disabled="loading" @click="closeCreateWorkflow">
					Cancel
				</button>
				<button class="btn-primary flex-1" :disabled="isDisabled || loading">
					<span v-if="!loading"> Create Workflow </span>
					<Spinner v-else />
				</button>
			</footer>
		</form>
	</Modal>
</template>

<script setup lang="ts">
import { X } from 'lucide-vue-next'
import { useFlowsModal } from '@/composables/core/modals'
import { useCreateFlow } from '@/composables/dashboard/flows/create'

const { closeCreateWorkflow } = useFlowsModal()
const { createWorkflowModal, loading, createFlowForm, isDisabled } = useCreateFlow()

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
