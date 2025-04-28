<template>
	<Modal
		modal="$atts.modal"
		:title="editingFieldIndex === -1 ? 'Add New Field' : 'Edit Field'"
		:is-full-height="false"
		:props-modal="propsModal"
	>
		<form @submit.prevent="onSave">
			<div class="space-y-4">
				<!-- Field Name -->
				<div>
					<label for="field-name" class="block text-sm font-medium text-text-secondary mb-1">
						Field Name <span class="text-red">*</span>
					</label>
					<input
						id="field-name"
						v-model="fieldForm.name"
						type="text"
						class="input-field"
						placeholder="Enter field name"
						required
					>
				</div>

				<!-- Field Type -->
				<div>
					<label for="field-type" class="block text-sm font-medium text-text-secondary mb-1">
						Field Type <span class="text-red">*</span>
					</label>
					<select
						id="field-type"
						v-model="fieldForm.type"
						class="input-field"
						required
					>
						<option value="text">
							Text
						</option>
						<option value="number">
							Number
						</option>
						<option value="date">
							Date
						</option>
						<option value="time">
							Time
						</option>
						<option value="boolean">
							Boolean
						</option>
						<option value="select">
							Select (Dropdown)
						</option>
						<option value="email">
							Email
						</option>
						<option value="url">
							URL
						</option>
						<option value="textarea">
							Text Area
						</option>
					</select>
				</div>

				<!-- Options for Select Type -->
				<div v-if="fieldForm.type === 'select'">
					<label for="field-options" class="block text-sm font-medium text-text-secondary mb-1">
						Options <span class="text-red">*</span>
					</label>
					<textarea
						id="field-options"
						v-model="fieldForm.optionsText"
						class="input-field min-h-[100px]"
						placeholder="Enter one option per line"
						required
					/>
					<p class="text-xs text-text-secondary mt-1">
						Enter one option per line
					</p>
				</div>

				<!-- Field Description -->
				<div>
					<label for="field-description" class="block text-sm font-medium text-text-secondary mb-1">
						Description
					</label>
					<textarea
						id="field-description"
						v-model="fieldForm.description"
						class="input-textarea"
						placeholder="Enter field description (optional)"
					/>
				</div>

				<!-- Required Field -->
				<div class="flex items-center">
					<input
						id="field-required"
						v-model="fieldForm.required"
						type="checkbox"
						class="h-4 w-4 text-primary focus:ring-primary border-border rounded"
					>
					<label for="field-required" class="ml-2 block text-sm text-text-secondary">
						Required field
					</label>
				</div>
			</div>

			<div class="mt-6 flex justify-end gap-3">
				<button
					type="button"
					class="btn-outline border border-border px-4 py-2 rounded-md"
					@click="closeModal"
				>
					Cancel
				</button>
				<button
					type="submit"
					class="btn-primary px-4 py-2 rounded-md"
					:disabled="!isFormValid"
				>
					{{ editingFieldIndex === -1 ? 'Add Field' : 'Save Changes' }}
				</button>
			</div>
		</form>
	</Modal>
</template>

<script setup lang="ts">
import Modal from '@/components/core/modal/Modal.vue'
import { useTablesModal } from '@/composables/core/modals'


const props = defineProps({
	payload: {
		type: Object,
		default: null,
		required: false
	},
	propsModal: {
		type: String,
		required: false
	}
})

// Extract data from payload
const fieldForm = computed(() => props.payload?.fieldForm || {})
const editingFieldIndex = computed(() => props.payload?.editingFieldIndex || -1)
const onSaveCallback = computed(() => props.payload?.onSave)

// Close the modal
const closeModal = () => {
	useTablesModal().closeFieldModal()
}

// Handle save
const onSave = async () => {
	if (onSaveCallback.value && typeof onSaveCallback.value === 'function') {
		await onSaveCallback.value()
	}
}

const isFormValid = computed(() => {
	if (!fieldForm.value.name?.trim()) return false

	if (fieldForm.value.type === 'select') {
		const options = fieldForm.value.optionsText
			?.split('\n')
			.map((option) => option.trim())
			.filter((option) => option)

		return options && options.length > 0
	}

	return true
})
</script>

<style scoped>
</style>
