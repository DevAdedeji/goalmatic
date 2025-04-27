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
import { formatDate } from '@/composables/utils/formatter'
import { TableData } from '@/composables/dashboard/tables/types'
import { useTableDataSection } from '@/composables/dashboard/tables/dataSection'

const props = defineProps({
	tableData: {
		type: Object as () => TableData,
		required: true
	}
})

const emit = defineEmits(['switchTab'])

// Use the extracted logic from the composable
const {
	tableRecords,
	loading,
	selectedRecords,
	isAllSelected,
	toggleRecordSelection,
	isRecordSelected,
	toggleSelectAll,
	deleteSelectedRecords,
	addNewRecord,
	editRecord,
	deleteRecord,
	initializeRecords
} = useTableDataSection(props.tableData)

// Initialize records when component is mounted
onMounted(async () => {
	await initializeRecords()
})
</script>

<style scoped>
.icon-btn {
	@apply p-1 rounded-md hover:bg-gray-100 transition-colors;
}

.btn-outline-danger {
	@apply border border-red text-red transition-colors;
}
</style>
