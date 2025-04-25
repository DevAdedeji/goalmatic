<template>
	<div>
		<div class="flex justify-between items-center mb-6">
			<h2 class="text-lg font-medium text-headline">
				Fields Definition
			</h2>
			<button
				class="btn-primary flex items-center gap-2 px-4 py-2 rounded-md text-sm"
				@click="addNewField"
			>
				<PlusCircle :size="16" />
				Add Field
			</button>
		</div>

		<div v-if="!tableData.fields || tableData.fields.length === 0" class="text-center py-12 border border-dashed border-border rounded-lg">
			<Database :size="48" class="mx-auto mb-4 text-text-secondary opacity-40" />
			<h3 class="text-lg font-medium text-headline mb-2">
				No Fields Defined
			</h3>
			<p class="text-text-secondary mb-4">
				Define fields to structure your table
			</p>
			<button
				class="btn-primary flex items-center gap-2 px-4 py-2 rounded-md text-sm mx-auto"
				@click="addNewField"
			>
				<PlusCircle :size="16" />
				Add First Field
			</button>
		</div>

		<div v-else>
			<!-- Field list -->
			<div class="space-y-3">
				<div v-for="(field, index) in tableData.fields" :key="field.id" class="border border-border rounded-lg p-4 hover:border-primary/40 transition-colors">
					<div class="flex justify-between items-start">
						<div>
							<div class="flex items-center gap-2 mb-1">
								<h3 class="text-lg font-medium text-headline">
									{{ field.name }}
								</h3>
								<span class="bg-gray-100 text-text-secondary px-2 py-0.5 rounded text-xs">{{ field.type }}</span>
								<span v-if="field.required" class="bg-red-50 text-red-700 px-2 py-0.5 rounded text-xs">Required</span>
							</div>
							<p v-if="field.description" class="text-text-secondary text-sm">
								{{ field.description }}
							</p>
						</div>
						<div class="flex gap-2">
							<button class="icon-btn text-text-secondary hover:text-primary" @click="editField(index)">
								<Edit2 :size="18" />
							</button>
							<button class="icon-btn text-text-secondary hover:text-red" @click="deleteField(index)">
								<Trash2 :size="18" />
							</button>
						</div>
					</div>
				</div>
			</div>
		</div>

		<!-- Field Modal -->
		<TablesIdFieldModal
			v-if="fieldModalVisible"
			:field-form="fieldForm"
			:editing-field-index="editingFieldIndex"
			@save="saveField"
			@cancel="fieldModalVisible = false"
		/>
	</div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { PlusCircle, Edit2, Trash2, Database } from 'lucide-vue-next'
import TablesIdFieldModal from './FieldModal.vue'
import { useEditTable } from '@/composables/dashboard/tables/edit'

interface Field {
	id: string;
	name: string;
	type: string;
	description?: string;
	required?: boolean;
	options?: string[];
}

interface TableData {
	fields?: Field[];
	[key: string]: any;
}

const props = defineProps({
	tableData: {
		type: Object as () => TableData,
		required: true
	}
})

const { updateFieldInTable, removeFieldFromTable, addFieldToTable } = useEditTable()

// Define field form interface
interface FieldForm extends Omit<Field, 'options'> {
	options: string[];
	optionsText: string;
}

// Field management
const fieldModalVisible = ref(false)
const editingFieldIndex = ref(-1)
const fieldForm = ref<FieldForm>({
	id: crypto.randomUUID(),
	name: '',
	type: 'text',
	description: '',
	required: false,
	options: [],
	optionsText: ''
})

const addNewField = () => {
	// Reset form
	fieldForm.value = {
		id: crypto.randomUUID(),
		name: '',
		type: 'text',
		description: '',
		required: false,
		options: [],
		optionsText: ''
	}
	editingFieldIndex.value = -1
	fieldModalVisible.value = true
}

const editField = (index: number) => {
	if (!props.tableData.fields) return

	const field = props.tableData.fields[index]
	if (!field) return

	// Clone the field to avoid direct mutation
	fieldForm.value = {
		...JSON.parse(JSON.stringify(field)),
		optionsText: field.options ? field.options.join('\n') : ''
	}
	editingFieldIndex.value = index
	fieldModalVisible.value = true
}

const saveField = async () => {
	// Process options if it's a select field
	if (fieldForm.value.type === 'select') {
		fieldForm.value.options = fieldForm.value.optionsText
			.split('\n')
			.map((option) => option.trim())
			.filter((option) => option)
	}

	// Check if we're adding a new field or updating an existing one
	if (editingFieldIndex.value === -1) {
		// Add new field
		await addFieldToTable(props.tableData, fieldForm.value)
	} else if (props.tableData.fields && props.tableData.fields[editingFieldIndex.value]) {
		// Update existing field
		await updateFieldInTable(
			props.tableData,
			props.tableData.fields[editingFieldIndex.value].id,
			fieldForm.value
		)
	}

	fieldModalVisible.value = false
}

const deleteField = async (index: number) => {
	if (!props.tableData.fields || !props.tableData.fields[index]) return

	if (confirm('Are you sure you want to delete this field? This will also remove this field from all records.')) {
		await removeFieldFromTable(props.tableData, props.tableData.fields[index].id)
	}
}
</script>

<style scoped>
.icon-btn {
	@apply p-1 rounded-md hover:bg-gray-100 transition-colors;
}
</style>
