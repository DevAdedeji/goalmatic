<template>
	<Modal
		modal="$atts.modal"
		:title="editingRecordIndex === -1 ? 'Add New Record' : 'Edit Record'"
		:is-full-height="false"
		:props-modal="propsModal"
	>
		<form @submit.prevent="onSave">
			<div class="space-y-4">
				<div v-for="field in fields" :key="field.id">
					<!-- Text Field -->
					<div v-if="field.type === 'text' || field.type === 'email' || field.type === 'url'">
						<label :for="`field-${field.id}`" class="block text-sm font-medium text-text-secondary mb-1">
							{{ field.name }} <span v-if="field.required" class="text-danger">*</span>
							<Tooltip v-if="field.description" :open-delay="200" placement="top">
								<template #trigger>
									<Info class="ml-1 size-4 text-gray-400 hover:text-gray-600 cursor-help" />
								</template>
								<template #content>
									{{ field.description }}
								</template>
							</Tooltip>
						</label>
						<input
							:id="`field-${field.id}`"
							v-model="recordForm[field.id]"
							:type="field.type === 'email' ? 'email' : field.type === 'url' ? 'url' : 'text'"
							class="input-field"
							:placeholder="`Enter ${field.name.toLowerCase()}`"
							:required="field.required"
						>
					</div>

					<!-- Number Field -->
					<div v-else-if="field.type === 'number'">
						<label :for="`field-${field.id}`" class="block text-sm font-medium text-text-secondary mb-1">
							{{ field.name }} <span v-if="field.required" class="text-danger">*</span>
							<Tooltip v-if="field.description" :open-delay="200" placement="top">
								<template #trigger>
									<Info class="ml-1 size-4 text-gray-400 hover:text-gray-600 cursor-help" />
								</template>
								<template #content>
									{{ field.description }}
								</template>
							</Tooltip>
						</label>
						<input
							:id="`field-${field.id}`"
							v-model.number="recordForm[field.id]"
							type="number"
							class="input-field"
							:placeholder="`Enter ${field.name.toLowerCase()}`"
							:required="field.required"
						>
					</div>

					<!-- Date Field -->
					<div v-else-if="field.type === 'date'">
						<label :for="`field-${field.id}`" class="block text-sm font-medium text-text-secondary mb-1">
							{{ field.name }} <span v-if="field.required" class="text-danger">*</span>
							<Tooltip v-if="field.description" :open-delay="200" placement="top">
								<template #trigger>
									<Info class="ml-1 size-4 text-gray-400 hover:text-gray-600 cursor-help" />
								</template>
								<template #content>
									{{ field.description }}
								</template>
							</Tooltip>
						</label>
						<input
							:id="`field-${field.id}`"
							v-model="recordForm[field.id]"
							type="date"
							class="input-field"
							:required="field.required"
						>
					</div>

					<!-- Time Field -->
					<div v-else-if="field.type === 'time'">
						<label :for="`field-${field.id}`" class="block text-sm font-medium text-text-secondary mb-1">
							{{ field.name }} <span v-if="field.required" class="text-danger">*</span>
							<Tooltip v-if="field.description" :open-delay="200" placement="top">
								<template #trigger>
									<Info class="ml-1 size-4 text-gray-400 hover:text-gray-600 cursor-help" />
								</template>
								<template #content>
									{{ field.description }}
								</template>
							</Tooltip>
						</label>
						<input
							:id="`field-${field.id}`"
							v-model="recordForm[field.id]"
							type="time"
							class="input-field"
							:required="field.required"
						>
					</div>

					<!-- Boolean Field -->
					<div v-else-if="field.type === 'boolean'">
						<div class="flex items-center">
							<input
								:id="`field-${field.id}`"
								v-model="recordForm[field.id]"
								type="checkbox"
								class="form-checkbox h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
							>
							<label :for="`field-${field.id}`" class="ml-2 block text-sm text-text-secondary">
								{{ field.name }}
								<Tooltip v-if="field.description" :open-delay="200" placement="top">
									<template #trigger>
										<Info class="ml-1 size-4 text-gray-400 hover:text-gray-600 cursor-help" />
									</template>
									<template #content>
										{{ field.description }}
									</template>
								</Tooltip>
							</label>
						</div>
					</div>

					<!-- Select Field -->
					<div v-else-if="field.type === 'select'">
						<label :for="`field-${field.id}`" class="block text-sm font-medium text-text-secondary mb-1">
							{{ field.name }} <span v-if="field.required" class="text-danger">*</span>
							<Tooltip v-if="field.description" :open-delay="200" placement="top">
								<template #trigger>
									<Info class="ml-1 size-4 text-gray-400 hover:text-gray-600 cursor-help" />
								</template>
								<template #content>
									{{ field.description }}
								</template>
							</Tooltip>
						</label>
						<select
							:id="`field-${field.id}`"
							v-model="recordForm[field.id]"
							class="input-field"
							:required="field.required"
						>
							<option value="">
								Select an option
							</option>
							<option v-for="option in field.options" :key="option" :value="option">
								{{ option }}
							</option>
						</select>
					</div>

					<!-- Textarea Field -->
					<div v-else-if="field.type === 'textarea'">
						<label :for="`field-${field.id}`" class="block text-sm font-medium text-text-secondary mb-1">
							{{ field.name }} <span v-if="field.required" class="text-danger">*</span>
							<Tooltip v-if="field.description" :open-delay="200" placement="top">
								<template #trigger>
									<Info class="ml-1 size-4 text-gray-400 hover:text-gray-600 cursor-help" />
								</template>
								<template #content>
									{{ field.description }}
								</template>
							</Tooltip>
						</label>
						<textarea
							:id="`field-${field.id}`"
							v-model="recordForm[field.id]"
							class="input-field min-h-[80px]"
							:placeholder="`Enter ${field.name.toLowerCase()}`"
							:required="field.required"
						/>
					</div>
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
				>
					{{ editingRecordIndex === -1 ? 'Add Record' : 'Save Changes' }}
				</button>
			</div>
		</form>
	</Modal>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Timestamp } from 'firebase/firestore'
import { Info } from 'lucide-vue-next'
import Modal from '@/components/core/modal/Modal.vue'
import Tooltip from '@/components/core/Tooltip.vue'
import { useTablesModal } from '@/composables/core/modals'
import { formatTimeWithSeconds } from '@/composables/utils/formatter'
import type { Field } from '@/composables/dashboard/tables/types'


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
const recordForm = computed(() => props.payload?.recordForm || {})
const fields = computed(() => props.payload?.fields || [])
const editingRecordIndex = computed(() => props.payload?.editingRecordIndex || -1)
const onSaveCallback = computed(() => props.payload?.onSave)

// Close the modal
const closeModal = () => {
	useTablesModal().closeRecordModal()
}

// Format time and date fields before saving
const formatFields = () => {
	if (!fields.value || !recordForm.value) return

	fields.value.forEach((field: Field) => {
		// Handle time fields
		if (field.type === 'time' && recordForm.value[field.id]) {
			try {
				// HTML time input returns format like "13:45" or "13:45:00"
				// We need to create a Date object and format it as "12:11:47 PM"
				const timeValue = recordForm.value[field.id]
				const [hours, minutes, seconds = '00'] = timeValue.split(':').map(Number)

				// Create a date object with today's date and the time values
				const dateObj = new Date()
				dateObj.setHours(hours, minutes, seconds)

				// Format the time in 12-hour format with AM/PM
				recordForm.value[field.id] = formatTimeWithSeconds(dateObj)
			} catch (error) {
				console.error('Error formatting time:', error)
			}
		}

		// Handle date fields - convert to Firebase Timestamp
		if (field.type === 'date' && recordForm.value[field.id]) {
			try {
				// Convert the date string to a Date object and then to a Firebase Timestamp
				const dateValue = recordForm.value[field.id]
				const dateObj = new Date(dateValue)

				if (!isNaN(dateObj.getTime())) {
					recordForm.value[field.id] = Timestamp.fromDate(dateObj)
				}
			} catch (error) {
				console.error('Error converting date to Timestamp:', error)
			}
		}
	})
}

// Handle save
const onSave = async () => {
	formatFields()

	if (onSaveCallback.value && typeof onSaveCallback.value === 'function') {
		await onSaveCallback.value()
	}
}
</script>

<style scoped>
label{
	@apply flex items-center gap-2
}
</style>
