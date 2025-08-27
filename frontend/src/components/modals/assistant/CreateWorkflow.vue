<template>
	<Modal
		modal="$atts.modal"
		:title="isEditMode ? 'Edit Workflow' : 'Create Workflow'"
		:props-modal="propsModal"
		modal-content-class="p-0 "
	>
		<template #header>
			<div class="flex flex-col relative w-full">
				<h2 class="text-lg font-semibold">
					{{ isEditMode ? 'Edit your workflow' : 'Create a new workflow' }}
				</h2>
				<p class="text-sm text-[#535862]">
					{{ isEditMode ? 'Update your workflow name and description' : 'Give your workflow a name and description' }}
				</p>

				<button class="absolute top-0 right-0 " type="button" @click="closeCreateWorkflow">
					<X class="size-6" />
				</button>
			</div>
		</template>
		<form class="flex flex-col " @submit.prevent="isEditMode ? updateWorkflowModal() : createWorkflowModal()">
			<div class="p-2.5">
				<section class="flex flex-col p-2.5 gap-4  bg-[#F9FAFB] rounded-[10px]">
					<div class="field relative mt-6">
						<label for="name">Workflow Name</label>
						<input
							v-model="formData.name"
							required
							class="input-field"
							placeholder="Give your workflow a name"
						>
					</div>
					<div class="field relative">
						<label for="description">Workflow Description</label>
						<textarea
							v-model="formData.description"
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
					<span v-if="!loading">{{ isEditMode ? 'Update Workflow' : 'Create Workflow' }}</span>
					<Spinner v-else />
				</button>
			</footer>
		</form>
	</Modal>
</template>

<script setup lang="ts">
import { X } from 'lucide-vue-next'
import { reactive, computed, watch } from 'vue'
import { Timestamp } from 'firebase/firestore'
import { useFlowsModal } from '@/composables/core/modals'
import { useCreateFlow } from '@/composables/dashboard/flows/create'
import { useEditFlow } from '@/composables/dashboard/flows/edit'

const { closeCreateWorkflow } = useFlowsModal()
const { createWorkflowModal, loading: createLoading, createFlowForm, isDisabled: createDisabled, resetForm } = useCreateFlow()
const { updateFlow, loading: updateLoading } = useEditFlow()

const props = defineProps({
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

// Check if we're in edit mode
const isEditMode = computed(() => props.payload?.mode === 'edit')

// Form data that works for both create and edit modes
const formData = reactive({
	name: '',
	description: ''
})

// Loading state for both modes
const loading = computed(() => isEditMode.value ? updateLoading.value : createLoading.value)

// Disabled state
const isDisabled = computed(() => {
	if (isEditMode.value) {
		return !formData.name.trim()
	}
	return createDisabled.value
})

// Watch for payload changes to populate form in edit mode
watch(() => props.payload, (newPayload) => {
	if (newPayload?.mode === 'edit' && newPayload?.flowData) {
		formData.name = newPayload.flowData.name || ''
		formData.description = newPayload.flowData.description || ''
	} else {
		// Reset form for create mode
		formData.name = ''
		formData.description = ''
		resetForm()
	}
}, { immediate: true, deep: true })

// Sync form data with createFlowForm for create mode
watch(() => formData, (newFormData) => {
	if (!isEditMode.value) {
		createFlowForm.name = newFormData.name
		createFlowForm.description = newFormData.description
	}
}, { deep: true })

// Update workflow function for edit mode
const updateWorkflowModal = async () => {
	if (!props.payload?.flowData) return

	const updatedFlow = {
		...props.payload.flowData,
		name: formData.name,
		description: formData.description,
		updated_at: Timestamp.fromDate(new Date())
	}

	await updateFlow(updatedFlow)
	closeCreateWorkflow()
}
</script>

<style>

</style>
