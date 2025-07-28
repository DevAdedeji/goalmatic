<template>
	<section class="flex flex-col gap-4 center pt-6 px-4 md:px-9">
		<div class="flex justify-between items-center w-full">
			<div class="flex flex-col">
				<h1 class="md:text-2xl font-semibold ">
					Smart Tables
				</h1>
				<p class="md:text-base text-xs font-medium text-[#666F8D]">
					Create and manage structured data tables to keep your information organized
				</p>
			</div>
			<button v-if="isLoggedIn" class="btn-primary !px-3 md:px-6" @click="openCreateTableModal">
				Create Table
			</button>
		</div>

		<div class="flex flex-col gap-4  w-full ">
			<!-- Search Section -->
			<section class="controls flex justify-end gap-2">
				<div class="options w-full md:w-auto">
					<div class="relative w-full">
						<Search
							class="absolute left-3 top-[48%] transform -translate-y-1/2 size-4 text-gray-400"
						/>
						<input
							v-model="searchQuery"
							type="text"
							placeholder="Search tables"
							class="searchInput md:min-w-[318px] w-full"
						>
					</div>
				</div>
			</section>

			<!-- Tables Grid -->
			<div class="mb-12 pt-2">
				<!-- Loading State -->
				<div v-if="loading" class="min-h-[200px]">
					<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
						<div v-for="i in 6" :key="i" class="flex flex-col card-skeleton">
							<Skeleton width="32px" height="32px" radius="6px" />
							<Skeleton width="70%" height="16px" radius="4px" class="mt-4 mb-2" />
							<Skeleton width="90%" height="12px" radius="4px" />
						</div>
					</div>
				</div>

				<!-- Empty State -->
				<div
					v-else-if="tablesOnDisplay.length === 0 && !loading"
					class="flex flex-col items-center justify-center py-8 px-4 text-center min-h-[200px]"
				>
					<div class="flex items-center justify-center size-12 bg-gray-100 rounded-full mb-3">
						<Database class="size-6 text-gray-400" />
					</div>
					<h4 class="text-sm font-medium text-gray-700 mb-1">
						{{ searchQuery ? 'No tables found' : 'No tables available' }}
					</h4>
					<p class="text-xs text-gray-500 mb-4">
						{{ searchQuery
							? `No tables match "${searchQuery}". Try adjusting your search.`
							: 'Create your first table to get started.'
						}}
					</p>
					<button
						v-if="!searchQuery"
						class="btn-primary"
						@click="openCreateTableModal"
					>
						Create Table
					</button>
					<button
						v-else
						class="btn-outline text-xs px-3 py-1.5"
						@click="searchQuery = ''"
					>
						Clear Search
					</button>
				</div>

				<!-- Tables Grid -->
				<div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
					<TableCard v-for="(table, index) in tablesOnDisplay" :key="table?.id || index" :table="table" @edit="useRouter().push(`/tables/${table.id}`)" @delete="setDeleteTableData" />
				</div>
			</div>
		</div>
	</section>
</template>

<script setup lang="ts">
import { Database, Search } from 'lucide-vue-next'

import { useFetchUserTables } from '@/composables/dashboard/tables/fetch'
import { useDeleteTable } from '@/composables/dashboard/tables/delete'
import { useTablesModal } from '@/composables/core/modals'
import { useHeaderTitle } from '@/composables/core/headerTitle'
import { useUser } from '@/composables/auth/user'
import type { Table } from '@/composables/dashboard/tables/types'
import TableCard from '@/components/tables/Card.vue'
import Skeleton from '@/components/core/skeleton.vue'

definePageMeta({
	layout: 'dashboard'
})

// Get user authentication status
const { id: user_id, isLoggedIn } = useUser()

// Reactive data
const searchQuery = ref('')

const { userTables, loading, fetchAllUserTables } = useFetchUserTables()
const { setDeleteTableData } = useDeleteTable()
const { openCreateTable } = useTablesModal()

// Create a function to open table creation (similar to openCreateWorkflow)
const openCreateTableModal = () => {
	openCreateTable()
}

// Computed tables on display
const tablesOnDisplay = computed((): Table[] => {
	const tables = userTables.value as Table[]
	return tables.filter((table: Table) =>
		table.name?.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
		table.description?.toLowerCase().includes(searchQuery.value.toLowerCase())
	)
})

onMounted(async () => {
	if (isLoggedIn.value) {
		await fetchAllUserTables()
	}
})

useHeaderTitle().setTitle('Smart Tables')
</script>

<style scoped lang="postcss">
.controls {
	@apply flex items-center justify-end border-b border-[#E9EAEB] pb-5 mb-4;
	.options {
		@apply items-center gap-2;
	}
}

.card-skeleton {
	@apply bg-[#FCFAFF] border border-[#EFE8FD] rounded-lg py-4 px-3.5;
}

.searchInput {
	@apply w-full px-3 py-2 pl-10 border border-gray-200 rounded-lg bg-white text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent;
}
</style>
