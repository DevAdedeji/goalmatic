<template>
	<Modal :show="true" @close="$emit('cancel')">
		<div class="p-6">
			<h2 class="text-xl font-medium text-headline mb-4">
				{{ editingRecordIndex === -1 ? 'Add New Record' : 'Edit Record' }}
			</h2>

			<form @submit.prevent="$emit('save')">
				<div class="space-y-4">
					<div v-for="field in fields" :key="field.id">
						<!-- Text Field -->
						<div v-if="field.type === 'text' || field.type === 'email' || field.type === 'url'">
							<label :for="`field-${field.id}`" class="block text-sm font-medium text-text-secondary mb-1">
								{{ field.name }} <span v-if="field.required" class="text-red">*</span>
							</label>
							<input
								:id="`field-${field.id}`"
								v-model="recordForm[field.id]"
								:type="field.type === 'email' ? 'email' : field.type === 'url' ? 'url' : 'text'"
								class="w-full p-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/30"
								:placeholder="`Enter ${field.name.toLowerCase()}`"
								:required="field.required"
							>
						</div>

						<!-- Number Field -->
						<div v-else-if="field.type === 'number'">
							<label :for="`field-${field.id}`" class="block text-sm font-medium text-text-secondary mb-1">
								{{ field.name }} <span v-if="field.required" class="text-red">*</span>
							</label>
							<input
								:id="`field-${field.id}`"
								v-model.number="recordForm[field.id]"
								type="number"
								class="w-full p-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/30"
								:placeholder="`Enter ${field.name.toLowerCase()}`"
								:required="field.required"
							>
						</div>

						<!-- Date Field -->
						<div v-else-if="field.type === 'date'">
							<label :for="`field-${field.id}`" class="block text-sm font-medium text-text-secondary mb-1">
								{{ field.name }} <span v-if="field.required" class="text-red">*</span>
							</label>
							<input
								:id="`field-${field.id}`"
								v-model="recordForm[field.id]"
								type="date"
								class="w-full p-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/30"
								:required="field.required"
							>
						</div>

						<!-- Time Field -->
						<div v-else-if="field.type === 'time'">
							<label :for="`field-${field.id}`" class="block text-sm font-medium text-text-secondary mb-1">
								{{ field.name }} <span v-if="field.required" class="text-red">*</span>
							</label>
							<input
								:id="`field-${field.id}`"
								v-model="recordForm[field.id]"
								type="time"
								class="w-full p-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/30"
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
									class="h-4 w-4 text-primary focus:ring-primary border-border rounded"
								>
								<label :for="`field-${field.id}`" class="ml-2 block text-sm text-text-secondary">
									{{ field.name }}
								</label>
							</div>
						</div>

						<!-- Select Field -->
						<div v-else-if="field.type === 'select'">
							<label :for="`field-${field.id}`" class="block text-sm font-medium text-text-secondary mb-1">
								{{ field.name }} <span v-if="field.required" class="text-red">*</span>
							</label>
							<select
								:id="`field-${field.id}`"
								v-model="recordForm[field.id]"
								class="w-full p-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/30"
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
								{{ field.name }} <span v-if="field.required" class="text-red">*</span>
							</label>
							<textarea
								:id="`field-${field.id}`"
								v-model="recordForm[field.id]"
								class="w-full p-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/30 min-h-[80px]"
								:placeholder="`Enter ${field.name.toLowerCase()}`"
								:required="field.required"
							/>
						</div>

						<!-- Field description if available -->
						<p v-if="field.description" class="text-xs text-text-secondary mt-1">
							{{ field.description }}
						</p>
					</div>
				</div>

				<div class="mt-6 flex justify-end gap-3">
					<button
						type="button"
						class="btn-outline border border-border px-4 py-2 rounded-md"
						@click="$emit('cancel')"
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
		</div>
	</Modal>
</template>

<script setup lang="ts">
import Modal from '@/components/core/modal/Modal.vue'

interface Field {
	id: string;
	name: string;
	type: string;
	description?: string;
	required?: boolean;
	options?: string[];
}

defineProps({
	recordForm: {
		type: Object as () => Record<string, any>,
		required: true
	},
	fields: {
		type: Array as () => Field[],
		required: true
	},
	editingRecordIndex: {
		type: Number,
		required: true
	}
})

defineEmits(['save', 'cancel'])
</script>

<style scoped>
</style>
