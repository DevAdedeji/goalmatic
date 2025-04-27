<template>
	<div>
		<div class="flex justify-between items-center mb-6">
			<div class="flex items-center gap-4">
				<h2 class="text-lg font-medium text-headline">
					Table Records
				</h2>
				<div v-if="loading" class="flex items-center gap-2 text-text-secondary">
					<div class="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full" />
					<span class="text-sm">Loading...</span>
				</div>
				<button
					v-if="selectedRecords.length > 0"
					class="btn-outline-danger flex items-center gap-2 px-4 py-2 rounded-md text-sm"
					:disabled="loading"
					@click="deleteSelectedRecords"
				>
					<Trash2 :size="16" />
					Delete Selected ({{ selectedRecords.length }})
				</button>
			</div>
			<button
				class="btn-primary flex items-center gap-2 px-4 py-2 rounded-md text-sm"
				:disabled="loading || !tableData.fields || tableData.fields.length === 0"
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

		<div v-else-if="!tableRecords || tableRecords.length === 0" class="text-center py-12 border border-dashed border-border rounded-lg">
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
						<tr v-for="(record) in tableRecords" :key="record.id" class="hover:bg-gray-50">
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
									<button
										class="icon-btn text-text-secondary hover:text-primary"
										:disabled="loading"
										@click="editRecord(record.id)"
									>
										<Edit2 :size="16" />
									</button>
									<button
										class="icon-btn text-text-secondary hover:text-red"
										:disabled="loading"
										@click="deleteRecord(record.id)"
									>
										<Trash2 :size="16" />
									</button>
								</div>
							</td>
						</tr>
					</tbody>
				</table>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import { PlusCircle, Edit2, Trash2, Database } from 'lucide-vue-next'
import { useEditTable } from '@/composables/dashboard/tables/edit'
import { useFetchUserTables } from '@/composables/dashboard/tables/fetch'
import { formatDate } from '@/composables/utils/formatter'
import { useTablesModal } from '@/composables/core/modals'


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
const { addRecordToTable, updateRecordInTable, removeRecordFromTable, removeMultipleRecordsFromTable, loading: editLoading } = useEditTable()
const { fetchTableRecords, tableRecords, loading: fetchLoading } = useFetchUserTables()


// Record management
const editingRecordIndex = ref(-1)
const recordForm = ref({} as any)
const localLoading = ref(false)


// Computed property for overall loading state
const loading = computed(() => editLoading.value || fetchLoading.value || localLoading.value)

// Reset form function
const resetForm = () => {
  recordForm.value = {}
  editingRecordIndex.value = -1
}

// Fetch records when component mounts or table changes
onMounted(async () => {
  if (props.tableData && props.tableData.id) {
    await fetchTableRecords(props.tableData.id)
  }
})

watch(() => props.tableData?.id, async (newId) => {
  if (newId) {
    await fetchTableRecords(newId)
  }
})

// Selection management
const selectedRecords = ref<string[]>([])

// Computed property to check if all records are selected
const isAllSelected = computed(() => {
	if (!tableRecords.value || tableRecords.value.length === 0) return false
	return tableRecords.value.length === selectedRecords.value.length
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
		selectedRecords.value = tableRecords.value?.map((record) => record.id) || []
	}
}

// Delete selected records
const deleteSelectedRecords = async () => {
	if (selectedRecords.value.length === 0) return

	if (confirm(`Are you sure you want to delete ${selectedRecords.value.length} selected record(s)?`)) {
		localLoading.value = true
		try {
			const success = await removeMultipleRecordsFromTable(props.tableData, selectedRecords.value)
			if (success) {
				// Refresh records after delete
				await fetchTableRecords(props.tableData.id)
				// Clear selection
				selectedRecords.value = []
			}
		} catch (error) {
			console.error('Error deleting selected records:', error)
		} finally {
			localLoading.value = false
		}
	}
}

const addNewRecord = () => {
	// Reset form first
	resetForm()

	// Initialize empty record with all fields
	const newRecord: Record = { id: crypto.randomUUID() }
	if (props.tableData.fields) {
		props.tableData.fields.forEach((field) => {
			newRecord[field.id] = getDefaultValueForType(field.type)
		})
	}

	recordForm.value = newRecord
	editingRecordIndex.value = -1

	// Open the record modal with the current form data and editing index
	useTablesModal().openRecordModal({
		recordForm: recordForm.value,
		fields: props.tableData.fields || [],
		editingRecordIndex: editingRecordIndex.value,
		onSave: saveRecord
	})
}

const editRecord = (recordId: string) => {
	// Reset form first
	resetForm()

	// Find the record in tableRecords
	const record = tableRecords.value.find((r) => r.id === recordId)
	if (record) {
		// Clone the record to avoid direct mutation
		recordForm.value = JSON.parse(JSON.stringify(record))
		editingRecordIndex.value = tableRecords.value.findIndex((r) => r.id === recordId)

		// Open the record modal with the current form data and editing index
		useTablesModal().openRecordModal({
			recordForm: recordForm.value,
			fields: props.tableData.fields || [],
			editingRecordIndex: editingRecordIndex.value,
			onSave: saveRecord
		})
	}
}

const saveRecord = async () => {
	localLoading.value = true
	try {
		// Check if we're adding a new record or updating an existing one
		if (editingRecordIndex.value === -1) {
			// Add new record
			await addRecordToTable(props.tableData, recordForm.value)
		} else {
			// Update existing record
			await updateRecordInTable(
				props.tableData,
				recordForm.value?.id,
				recordForm.value
			)
		}

		// Refresh records after save
		await fetchTableRecords(props.tableData.id)

		// Reset the form
		resetForm()

		// Close the modal
		useTablesModal().closeRecordModal()
	} catch (error) {
		console.error('Error saving record:', error)
	} finally {
		localLoading.value = false
	}
}

const deleteRecord = async (recordId: string) => {
	if (confirm('Are you sure you want to delete this record?')) {
		localLoading.value = true
		try {
			await removeRecordFromTable(props.tableData, recordId)
			// Refresh records after delete
			await fetchTableRecords(props.tableData.id)
		} catch (error) {
			console.error('Error deleting record:', error)
		} finally {
			localLoading.value = false
		}
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
