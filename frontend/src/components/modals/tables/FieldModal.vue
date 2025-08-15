<template>
	<Modal
		modal="$attrs.modal"
		:title="editingFieldIndex === -1 ? 'Add New Field' : 'Edit Field'"
		:props-modal="propsModal"
	>
		<form @submit.prevent="payload.onSave()">
			<div class="space-y-4">
				<!-- Field Name -->
				<div>
					<label for="field-name" class="block text-sm font-medium text-text-secondary mb-1">
						Field Name <span class="text-danger">*</span>
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
						Field Type <span class="text-danger">*</span>
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
						Options <span class="text-danger">*</span>
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
						class="form-checkbox h-4 w-4 text-primary focus:ring-primary border-border rounded"
					>
					<label for="field-required" class="ml-2 block text-sm text-text-secondary">
						Required field
					</label>
				</div>

				<!-- Prevent Duplicates -->
				<div class="flex items-center">
					<input
						id="field-unique"
						v-model="fieldForm.preventDuplicates"
						type="checkbox"
						class="form-checkbox h-4 w-4 text-primary focus:ring-primary border-border rounded"
					>
					<label for="field-unique" class="ml-2 block text-sm text-text-secondary">
						Prevent duplicate values for this field
					</label>
				</div>
			</div>

			<div class="mt-6 flex justify-end gap-3 w-full">
				<button
					v-if="editingFieldIndex === -1"
					type="button"
					class="btn-outline flex-1 !px-2 text-sm"
					:disabled="!isFormValid"
					@click="saveAndCreateAnother"
				>
					Add and Create Another
				</button>
				<button
					v-else
					type="button"
					class="btn-outline flex-1 !px-2 text-sm"
					@click="closeModal"
				>
					Cancel
				</button>
				<button
					type="submit"
					class="btn-primary flex-1 text-sm"
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
const editingFieldIndex = computed(() => props.payload?.editingFieldIndex ?? -1)


// Close the modal
const closeModal = () => {
	useTablesModal().closeFieldModal()
}

// Save current field and create another
const saveAndCreateAnother = async () => {
	try {
		// Save the current field without closing the modal
		await props.payload?.onSaveOnly()

		// Reset the form for creating a new field
		if (props.payload?.fieldForm) {
			// Reset all form fields with a new ID
			Object.assign(props.payload.fieldForm, {
				id: crypto.randomUUID(),
				name: '',
				type: 'text',
				description: '',
				required: false,
				optionsText: '',
				options: []
			})
		}

		// Keep the modal open for creating another field
	} catch (error) {
		console.error('Error saving field:', error)
		// Optionally show an error message to the user
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
