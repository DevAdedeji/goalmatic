<template>
	<ClientOnly>
		<div class="p-4 sm:p-6">
			<TablesIdLoader v-if="loading" />


			<div v-else-if="tableData">
				<TablesIdHeader v-model:current-tab="currentTab" :table-data="tableData" />


				<TablesIdDetails
					:current-tab="currentTab"
					class="mt-5"
					@switch-tab="currentTab = $event"
				/>
			</div>

			<TablesIdErrorState v-else @back-to-tables="router.push('/tables')" />
		</div>
	</ClientOnly>
</template>

<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router'
import { useFetchUserTables } from '@/composables/dashboard/tables/fetch'
import TablesIdHeader from '@/components/tables/id/Header.vue'
import TablesIdDetails from '@/components/tables/id/Details.vue'
import TablesIdLoader from '@/components/tables/id/Loader.vue'
import TablesIdErrorState from '@/components/tables/id/ErrorState.vue'
import { useHeaderTitle } from '@/composables/core/headerTitle'

const route = useRoute()
const router = useRouter()
const tableId = route.params.id as string
const { fetchTableById, tableData, loading } = useFetchUserTables()




// Tab state
const currentTab = ref('structure')

await fetchTableById(tableId)
useHeaderTitle().setTitle(`Table: ${tableData.value?.name || 'Loading...'}`)
definePageMeta({
	layout: 'dashboard',
	middleware: ['is-authenticated']
})
</script>

<style scoped>
.icon-btn {
	@apply p-1 rounded-full hover:bg-gray-100 transition-colors;
}
</style>
