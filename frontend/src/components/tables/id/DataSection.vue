<template>
	<div>
		<div class="flex justify-between items-center mb-6">
			<div class="flex items-center gap-4">
				<h2 class="text-lg font-medium text-headline">
					Table Records
				</h2>
				<button
					v-if="selectedRecords.length > 0"
					class="btn-outline-danger flex items-center gap-2 px-4 py-2 rounded-md text-sm"
					@click="deleteSelectedRecords"
				>
					<Trash2 :size="16" />
					Delete Selected ({{ selectedRecords.length }})
				</button>
			</div>
			<button
				class="btn-primary flex items-center gap-2 px-4 py-2 rounded-md text-sm"
				:disabled="!tableData.fields || tableData.fields.length === 0"
				@click="addNewRecord"
			>
				<PlusCircle :size="16" />
				Add Record
			</button>
		</div>

		<div v-if="!tableData.fields || tableData.fields.length === 0" class="text-center py-12 border border-dashed border-border rounded-lg">
			<Database :size="48" class="mx-auto mb-4 text-text-secondary opacity-40" />
			<h3 class="text-lg font-medium text-headline mb-2">
				No Fields Defined
			</h3>
			<p class="text-text-secondary mb-4">
				You need to define fields in the Structure tab before adding records
			</p>
			<button
				class="btn-outline border border-border px-4 py-2 rounded-md text-sm mx-auto"
				@click="$emit('switchTab', 'structure')"
			>
				Go to Structure Tab
			</button>
		</div>

		<div v-else-if="!tableData.records || tableData.records.length === 0" class="text-center py-12 border border-dashed border-border rounded-lg">
			<Database :size="48" class="mx-auto mb-4 text-text-secondary opacity-40" />
			<h3 class="text-lg font-medium text-headline mb-2">
				No Records Yet
			</h3>
			<p class="text-text-secondary mb-4">
				Add your first record to start populating the table
			</p>
			<button
				class="btn-primary flex items-center gap-2 px-4 py-2 rounded-md text-sm mx-auto"
				@click="addNewRecord"
			>
				<PlusCircle :size="16" />
				Add First Record
			</button>
		</div>

		<div v-else>
			<!-- Table of records -->
			<div class="overflow-x-auto border border-border rounded-lg">
				<table class="min-w-full divide-y divide-border">
					<thead class="bg-gray-50">
						<tr>
							<th scope="col" class="px-4 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
								<div class="flex items-center">
									<input
										type="checkbox"
										:checked="isAllSelected"
										class="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
										@change="toggleSelectAll"
									>
								</div>
							</th>
							<th scope="col" class="px-4 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
								ID
							</th>
							<th v-for="field in tableData.fields" :key="field.id" scope="col" class="px-4 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
								{{ field.name }}
							</th>
							<th scope="col" class="px-4 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
								Actions
							</th>
						</tr>
					</thead>
					<tbody class="bg-white divide-y divide-border">
						<tr v-for="(record, index) in tableData.records" :key="record.id" class="hover:bg-gray-50">
							<td class="px-4 py-3 whitespace-nowrap text-sm">
								<div class="flex items-center">
									<input
										type="checkbox"
										:checked="isRecordSelected(record.id)"
										class="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
										@change="toggleRecordSelection(record.id)"
									>
								</div>
							</td>
							<td class="px-4 py-3 whitespace-nowrap text-sm text-text-secondary">
								{{ record.id.substring(0, 8) }}...
							</td>
							<td v-for="field in tableData.fields" :key="field.id" class="px-4 py-3 whitespace-nowrap text-sm text-text-secondary">
								<span v-if="field.type === 'boolean'">
									{{ record[field.id] ? 'Yes' : 'No' }}
								</span>
								<span v-else-if="field.type === 'date' && record[field.id]">
									{{ formatDate(record[field.id]) }}
								</span>
								<span v-else-if="field.type === 'time' && record[field.id]">
									{{ record[field.id] }}
								</span>
								<span v-else>
									{{ record[field.id] || '-' }}
								</span>
							</td>
							<td class="px-4 py-3 whitespace-nowrap text-sm">
								<div class="flex gap-2">
									<button class="icon-btn text-text-secondary hover:text-primary" @click="editRecord(index)">
										<Edit2 :size="16" />
									</button>
									<button class="icon-btn text-text-secondary hover:text-red" @click="deleteRecord(index)">
										<Trash2 :size="16" />
									</button>
								</div>
							</td>
						</tr>
					</tbody>
				</table>
			</div>
		</div>

		<!-- Record Modal -->
		<TablesIdRecordModal
			v-if="recordModalVisible"
			:record-form="recordForm"
			:fields="tableData.fields || []"
			:editing-record-index="editingRecordIndex"
			@save="saveRecord"
			@cancel="recordModalVisible = false"
		/>
	</div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { PlusCircle, Edit2, Trash2, Database } from 'lucide-vue-next'
import TablesIdRecordModal from './RecordModal.vue'
import { useEditTable } from '@/composables/dashboard/tables/edit'
import { formatDate } from '@/composables/utils/formatter'
import { useAlert } from '@/composables/core/notification'

interface Field {
	id: string;
	name: string;
	type: string;
	description?: string;
	required?: boolean;
	options?: string[];
}

interface Record {
	id: string;
	[key: string]: any;
}

interface TableData {
	fields?: Field[];
	records?: Record[];
	[key: string]: any;
}

const props = defineProps({
	tableData: {
		type: Object as () => TableData,
		required: true
	}
})

const emit = defineEmits(['switchTab'])
const { addRecordToTable, updateRecordInTable, removeRecordFromTable, removeMultipleRecordsFromTable } = useEditTable()
const alert = useAlert()

// Record management
const recordModalVisible = ref(false)
const editingRecordIndex = ref(-1)
const recordForm = ref({})

// Selection management
const selectedRecords = ref<string[]>([])

// Computed property to check if all records are selected
const isAllSelected = computed(() => {
	if (!props.tableData.records || props.tableData.records.length === 0) return false
	return props.tableData.records.length === selectedRecords.value.length
})

// Toggle selection of a single record
const toggleRecordSelection = (recordId: string) => {
	const index = selectedRecords.value.indexOf(recordId)
	if (index === -1) {
		// Add to selection
		selectedRecords.value.push(recordId)
	} else {
		// Remove from selection
		selectedRecords.value.splice(index, 1)
	}
}

// Check if a record is selected
const isRecordSelected = (recordId: string) => {
	return selectedRecords.value.includes(recordId)
}

// Toggle selection of all records
const toggleSelectAll = () => {
	if (isAllSelected.value) {
		// Deselect all
		selectedRecords.value = []
	} else {
		// Select all
		selectedRecords.value = props.tableData.records?.map((record) => record.id) || []
	}
}

// Delete selected records
const deleteSelectedRecords = async () => {
	if (selectedRecords.value.length === 0) return

	if (confirm(`Are you sure you want to delete ${selectedRecords.value.length} selected record(s)?`)) {
		const success = await removeMultipleRecordsFromTable(props.tableData, selectedRecords.value)
		if (success) {
			alert.openAlert({ type: 'SUCCESS', msg: `${selectedRecords.value.length} record(s) deleted successfully` })
			selectedRecords.value = []
		} else {
			alert.openAlert({ type: 'ERROR', msg: 'Failed to delete records' })
		}
	}
}

const addNewRecord = () => {
	// Initialize empty record with all fields
	const newRecord: Record = { id: crypto.randomUUID() }
	if (props.tableData.fields) {
		props.tableData.fields.forEach((field) => {
			newRecord[field.id] = getDefaultValueForType(field.type)
		})
	}

	recordForm.value = newRecord
	editingRecordIndex.value = -1
	recordModalVisible.value = true
}

const editRecord = (index: number) => {
	// Clone the record to avoid direct mutation
	if (props.tableData.records && props.tableData.records[index]) {
		recordForm.value = JSON.parse(JSON.stringify(props.tableData.records[index]))
		editingRecordIndex.value = index
		recordModalVisible.value = true
	}
}

const saveRecord = async () => {
	// Check if we're adding a new record or updating an existing one
	if (editingRecordIndex.value === -1) {
		// Add new record
		await addRecordToTable(props.tableData, recordForm.value)
	} else if (props.tableData.records && props.tableData.records[editingRecordIndex.value]) {
		// Update existing record
		await updateRecordInTable(
			props.tableData,
			props.tableData.records[editingRecordIndex.value].id,
			recordForm.value
		)
	}

	recordModalVisible.value = false
}

const deleteRecord = async (index: number) => {
	if (props.tableData.records && props.tableData.records[index] && confirm('Are you sure you want to delete this record?')) {
		await removeRecordFromTable(props.tableData, props.tableData.records[index].id)
	}
}

// Helper function to get default values based on field type
const getDefaultValueForType = (type: string): any => {
	switch (type) {
		case 'number':
			return 0
		case 'boolean':
			return false
		case 'date':
			return new Date().toISOString().split('T')[0]
		case 'time': {
			// Return current time in HH:MM format
			const now = new Date()
			return `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`
		}
		default:
			return ''
	}
}
</script>

<style scoped>
.icon-btn {
	@apply p-1 rounded-md hover:bg-gray-100 transition-colors;
}

.btn-outline-danger {
	@apply border border-red text-red transition-colors;
}
</style>
