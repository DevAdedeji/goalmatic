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
			<Table
				:headers="tableHeaders"
				:table-data="tableRecords"
				:loading="loading"
				:checkbox="true"
				:selected="selectedRecords.map(id => ({ id }))"
				@checked="toggleRecordSelection($event.id)"
				@toggle-all="toggleSelectAll"
			>
				<template #empty>
					<Database :size="48" class="mx-auto mb-4 text-text-secondary opacity-40" />
					<h3 class="text-lg font-medium text-headline mb-2">
						No Records Yet
					</h3>
					<p class="text-text-secondary mb-4">
						Add your first record to start populating the table
					</p>
				</template>

				<template #item="{ item }">
					<span v-if="item.id" class="text-text-secondary">
						{{ item.data.id.substring(0, 8) }}...
					</span>
					<span v-else-if="item[getValueType('date')]" class="text-text-secondary">
						{{ formatDateValue(item.data[getValueType('date')]) }}
					</span>
					<span v-else-if="item[getValueType('time')]" class="text-text-secondary">
						{{ item.data[getValueType('time')] }}
					</span>

					<span v-else-if="item[getValueType('boolean')]" class="text-text-secondary">
						{{ item.data[getValueType('boolean')] ? 'Yes' : 'No' }}
					</span>





					<div v-else-if="item.actions" class="flex gap-2">
						<button
							class="icon-btn text-text-secondary hover:text-primary"
							:disabled="loading"
							@click.stop="editRecord(item.data.id)"
						>
							<Edit2 :size="16" />
						</button>
						<button
							class="icon-btn text-text-secondary hover:text-danger"
							:disabled="loading"
							@click.stop="deleteRecord(item.data.id)"
						>
							<Trash2 :size="16" />
						</button>
					</div>
				</template>
			</Table>
		</div>
	</div>
</template>

<script setup lang="ts">
import { PlusCircle, Edit2, Trash2, Database } from 'lucide-vue-next'
import { computed, onMounted } from 'vue'
import { formatDate } from '@/composables/utils/formatter'
import { useTableDataSection } from '@/composables/dashboard/tables/dataSection'
import Table from '@/components/core/Table.vue'


const emit = defineEmits(['switchTab'])

// Use the extracted logic from the composable
const {
	tableRecords,
	loading,
	selectedRecords,
	toggleRecordSelection,
	toggleSelectAll,
	deleteSelectedRecords,
	addNewRecord,
	editRecord,
	deleteRecord,
	initializeRecords,
	tableData
} = useTableDataSection()

// Generate headers dynamically based on table fields
const tableHeaders = computed(() => {
	const headers = [
		// { text: 'ID', value: 'id' }
	] as { text: string, value: string }[]

	// Add headers for each field
	if (tableData.value.fields) {
		tableData.value.fields.forEach((field) => {
			headers.push({
				text: field.name,
				value: field.id
			})
		})
	}

	// Add actions column
	headers.push({ text: 'Actions', value: 'actions' })

	return headers
})






const getValueType = (key: string) => {
	const res = tableData.value.fields?.find((f) => f.type === key)
	return res?.id || ''
}

const formatDateValue = (dateValue: any) => {
	if (!dateValue) return ''
	if (dateValue.toDate && typeof dateValue.toDate === 'function') return formatDate(dateValue.toDate())
	return formatDate(dateValue)
}

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
	@apply border border-danger text-danger transition-colors;
}
</style>
