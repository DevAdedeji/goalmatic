<template>
	<ClientOnly>
		<main class="p-4 sm:p-6">
			<TablesHeader :creating-table="createLoading" @createNewTable="createTable" />
			<TablesLoader v-if="loading" />
			<TablesEmptyState v-else-if="!userTables.length" @createNewTable="createTable" />

			<div v-else>
				<TablesList
					:tables="userTables"
					@edit="$router.push(`/tables/${$event.id}`)"
					@delete="setDeleteTableData($event)"
					@createNewTable="createTable"
				/>
			</div>
		</main>
	</ClientOnly>
</template>

<script setup lang="ts">

import { usePageHeader } from '@/composables/utils/header'
import { useFetchUserTables } from '@/composables/dashboard/tables/fetch'
import { useDeleteTable } from '@/composables/dashboard/tables/delete'
import { useCreateTable } from '@/composables/dashboard/tables/create'
import TablesHeader from '@/components/tables/Header.vue'
import TablesLoader from '@/components/tables/Loader.vue'
import TablesEmptyState from '@/components/tables/EmptyState.vue'
import TablesList from '@/components/tables/List.vue'


const { userTables, loading, fetchAllUserTables } = useFetchUserTables()
const { setDeleteTableData } = useDeleteTable()
const { createTable, loading: createLoading } = useCreateTable()



 fetchAllUserTables()

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
