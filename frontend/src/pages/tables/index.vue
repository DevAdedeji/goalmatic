<template>
	<main class="p-4 sm:p-6">
		<TablesHeader :creating-table="creatingTable" @createNewTable="createNewTable" />
		<TablesLoader v-if="loading" />
		<TablesEmptyState v-else-if="!userTables.length" @createNewTable="createNewTable" />

		<div v-else>
			<TablesList
				:tables="userTables"
				@edit="editTable($event)"
				@delete="setDeleteTableData($event)"
				@createNewTable="createNewTable"
			/>
		</div>
	</main>
</template>

<script setup lang="ts">

import { usePageHeader } from '@/composables/utils/header'
import { useFetchUserTables, useFetchTableRecords } from '@/composables/dashboard/tables/fetch'
import { useEditTable } from '@/composables/dashboard/tables/edit'
import { useDeleteTable } from '@/composables/dashboard/tables/delete'
import { useCreateTable } from '@/composables/dashboard/tables/create'
import { Table } from '@/composables/dashboard/tables/types'

import { useAlert } from '@/composables/core/notification'

// Import table components
import TablesHeader from '@/components/tables/Header.vue'
import TablesLoader from '@/components/tables/Loader.vue'
import TablesEmptyState from '@/components/tables/EmptyState.vue'
import TablesList from '@/components/tables/List.vue'

const router = useRouter()
const { userTables, loading, fetchAllTables } = useFetchUserTables()
const { highlightTable } = useEditTable()
const { setDeleteTableData } = useDeleteTable()
const { createTable, createTableForm, loading: createLoading } = useCreateTable()
const { fetchTableRecords } = useFetchTableRecords()
// Track loading states
const creatingDemo = ref(false)
const creatingTable = ref(false)

// Fetch tables on component mount
onMounted(async () => {
	await fetchAllTables()
})

// Create a new table and navigate to its detail page
const createNewTable = async () => {
	if (creatingTable.value) return

	creatingTable.value = true

	try {
		// Set default values for a new draft table
		createTableForm.name = 'New Table'
		createTableForm.description = 'A new table for organizing your data'
		createTableForm.type = 'standard'
		createTableForm.fields = []
		createTableForm.records = []

		// Create the table
		const tableId = await createTable()

		if (tableId) {
			// Navigate to the table detail page with the new ID
			router.push(`/tables/${tableId}`)
		} else {
			useAlert().openAlert({
				type: 'ERROR',
				msg: 'Failed to create table. Please try again.'
			})
			creatingTable.value = false
		}
	} catch (error: any) {
		console.error('Error creating table:', error)
		useAlert().openAlert({
			type: 'ERROR',
			msg: `Failed to create table: ${error.message || 'Unknown error'}`
		})
		creatingTable.value = false
	}
}



// Edit table
const editTable = (table: Table) => {
	highlightTable(table)
	router.push(`/tables/${table.id}`)
}

definePageMeta({
	layout: 'dashboard',
	middleware: ['is-authenticated', () => {
		usePageHeader().setPageHeader({
			title: 'Tables',
			description: 'Manage your data tables',
			btnText: 'Create New Table',
			btnCall: () => useRouter().push('/tables/create'),
			shouldShowFab: true,
			shouldShowTab: usePageHeader().isLargeScreen.value
		})
	}]
})
</script>

<style scoped>
.icon-btn {
	@apply p-1 rounded-md hover:bg-gray-100 transition-colors;
}

.btn-outline {
	@apply text-headline bg-transparent hover:text-primary transition-colors;
}

.loading-spinner {
	@apply w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin;
}

.loading-spinner.small {
	@apply w-4 h-4;
}
</style>
