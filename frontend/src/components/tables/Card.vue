<template>
	<div class="bg-lighter rounded-lg p-4 border border-line transition-all grid">
		<!-- Header with title and actions -->
		<div class="flex justify-between items-start mb-2">
			<h3 class="font-medium text-headline">
				{{ table.name }}
			</h3>
			<div class="flex gap-1">
				<button class="icon-btn text-text-secondary hover:text-headline" @click="$emit('edit', table)">
					<Edit2 :size="18" />
				</button>
				<button class="icon-btn text-text-secondary hover:text-danger" @click="$emit('delete', table)">
					<Trash2 :size="18" />
				</button>
			</div>
		</div>

		<!-- Description -->
		<p class="text-sm text-text-secondary mb-3 line-clamp-2">
			{{ table.description || 'No description' }}
		</p>

		<!-- Footer with info -->
		<div class="flex justify-between items-center mt-auto">
			<div class="flex items-center gap-2">
				<span class="text-xs text-text-secondary">{{ table.fields?.length || 0 }} fields</span>
				<span class="text-xs text-text-secondary">{{ recordsCount || 0 }} records</span>
			</div>
			<span class="text-xs text-text-secondary">{{ formatDate(table.updated_at.toDate()) }}</span>
		</div>
	</div>
</template>

<script setup lang="ts">
import { Edit2, Trash2 } from 'lucide-vue-next'
import { formatDate } from '@/composables/utils/formatter'
import { Table } from '@/composables/dashboard/tables/types'
import { useFetchTableRecordsCount } from '@/composables/dashboard/tables/fetch'

const props = defineProps<{
    table: Table
}>()

const emit = defineEmits<{
    (e: 'edit', table: Table): void
    (e: 'delete', table: Table): void
}>()

const { fetchTableRecordsCount, recordsCount } = useFetchTableRecordsCount()

onMounted(async () => {
    await fetchTableRecordsCount(props.table.id)
})
</script>

<style scoped>
.icon-btn {
    @apply p-1 rounded-md hover:bg-gray-100 transition-colors;
}
</style>
