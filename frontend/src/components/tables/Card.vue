<template>
	<article class="table-card" @click="$emit('edit', table)">
		<div class="card-body">
			<header class="card-header">
				<div class="title-section">
					<h4 class="table-title">
						{{ table.name }}
					</h4>
				</div>
				<div class="action-buttons">
					<IconDropdown
						:data="table"
						:children="dropdownItems"
						btn-class="icon-btn text-text-secondary hover:text-headline border p-1.5 rotate-90 rounded-md bg-[#F5F7F9] cursor-pointer"
						class-name="w-40"
						:index="0"
					/>
				</div>
			</header>

			<p class="table-description">
				{{ table.description || 'No description' }}
			</p>

			<!-- Last updated info -->
			<div v-if="table.updated_at" class="last-updated-info">
				<span class="last-updated-text">Updated {{ formatLastUpdated(table.updated_at) }}</span>
			</div>
		</div>

		<footer class="card-footer">
			<div class="info-section">
				<!-- Table stats -->
				<div class="table-stats">
					<span class="stat-item">{{ table.fields?.length || 0 }} fields</span>
					<span class="stat-separator">•</span>
					<span class="stat-item">{{ tableRecords.length || 0 }} records</span>
				</div>
			</div>

			<div class="creator-section">
				<!-- Creator info -->
				<div class="creator-info">
					<span class="creator-text">By {{ isOwnTable ? 'you' : (table.creator_name || 'Unknown') }}</span>
					<img
						v-if="table.creator_avatar || isOwnTable"
						:src="table.creator_avatar || '/bot.png'"
						:alt="isOwnTable ? 'You' : table.creator_name"
						class="creator-avatar"
					>
				</div>
			</div>
		</footer>
	</article>
</template>

<script setup lang="ts">
import { Edit2, Trash2, Database } from 'lucide-vue-next'
import { computed } from 'vue'
import { formatDate } from '@/composables/utils/formatter'
import type { Table } from '@/composables/dashboard/tables/types'
import { useFetchTableRecords } from '@/composables/dashboard/tables/fetch'
import { useUser } from '@/composables/auth/user'
import IconDropdown from '@/components/core/IconDropdown.vue'

const props = defineProps<{
    table: Table
}>()

const emit = defineEmits<{
    (e: 'edit', table: Table): void
    (e: 'delete', table: Table): void
}>()

const { id: user_id } = useUser()
const { fetchTableRecords, tableRecords } = useFetchTableRecords()

const isOwnTable = computed(() => {
    return props.table.creator_id === user_id.value
})

const formatLastUpdated = (updatedAt: any): string => {
    if (!updatedAt) return ''

    try {
        let date: Date

        // Handle Firebase Timestamp
        if (updatedAt && typeof updatedAt === 'object' && 'toDate' in updatedAt) {
            date = updatedAt.toDate()
        } else {
            date = new Date(updatedAt)
        }

        if (isNaN(date.getTime())) return ''

        const now = new Date()
        const diffMs = now.getTime() - date.getTime()
        const diffMins = Math.floor(diffMs / (1000 * 60))
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

        if (diffMins < 1) return 'just now'
        if (diffMins < 60) return `${diffMins}m ago`
        if (diffHours < 24) return `${diffHours}h ago`
        if (diffDays < 7) return `${diffDays}d ago`

        return date.toLocaleDateString()
    } catch (error) {
        return ''
    }
}

const dropdownItems = computed(() => [
    {
        name: 'Edit',
        icon: Edit2,
        func: (table: Table) => emit('edit', table)
    },
    {
        name: 'Delete',
        icon: Trash2,
        func: (table: Table) => emit('delete', table),
        class: 'text-red-600 hover:text-red-700'
    }
])

onMounted(async () => {
    await fetchTableRecords(props.table.id)
})
</script>

<style scoped lang="postcss">
.table-card {
    @apply bg-[#F5F7F9] flex flex-col border border-[#DCE3EA] rounded-xl overflow-hidden hover:border-[#C7CDD5] transition-all duration-200 cursor-pointer;
}

.card-body {
    @apply bg-white border-b border-[#EFE8FD] p-4 rounded-xl;
}

.card-header {
    @apply flex justify-between items-start mb-3;
}

.title-section {
    @apply flex items-start gap-2 flex-1;
}

.table-title {
    @apply text-[#1F1F1F] text-sm font-semibold leading-[140%] tracking-[-0.56px] line-clamp-2;
}

.action-buttons {
    @apply flex gap-1 flex-shrink-0;
}

.icon-btn {
    @apply p-1.5 rounded-md hover:bg-gray-100 transition-colors;
}

.table-description {
    @apply text-[#7A797E] text-xs font-medium leading-[14.4px] line-clamp-2 mb-3;
}

.last-updated-info {
    @apply mt-2;
}

.last-updated-text {
    @apply text-[#7A797E] text-xs font-medium;
}

.card-footer {
    @apply p-4 flex justify-between items-center bg-[#F5F7F9];
}

.info-section {
    @apply flex items-center gap-3;
}

.table-stats {
    @apply flex items-center gap-2 text-xs font-medium text-[#7A797E];
}

.stat-item {
    @apply text-[#7A797E];
}

.stat-separator {
    @apply text-[#7A797E];
}

.type-badge {
    @apply flex items-center gap-1.5 px-2 py-1 text-xs font-semibold rounded-full text-blue-800;
}

.type-text {
    @apply text-blue-800;
}

.creator-section {
    @apply flex items-center;
}

.creator-info {
    @apply flex items-center gap-2;
}

.creator-text {
    @apply text-xs font-semibold text-[#7A797E];
}

.creator-avatar {
    @apply w-[24px] h-[24px] rounded-full border border-white flex-shrink-0;
}
</style>
