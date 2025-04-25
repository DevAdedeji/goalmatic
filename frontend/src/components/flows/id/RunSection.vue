<template>
	<div class="mt-2">
		<div class="flex justify-between items-center mb-4">
			<h2 class="text-xl font-medium text-headline">
				Flow Execution History
			</h2>
			<button
				class="px-3 py-1 text-sm rounded-md border border-border hover:border-primary hover:text-primary transition-colors flex items-center gap-1"
				@click="$emit('refreshRuns')"
			>
				<RefreshCw :size="14" />
				Refresh
			</button>
		</div>

		<!-- Use Table component -->
		<Table
			:headers="tableHeaders"
			:table-data="flowRuns"
			:loading="loading"
			:checkbox="false"
		>
			<!-- Empty state slot (optional, Table component has its own) -->
			<template #empty>
				<div class="text-center py-10 ">
					<History class="mx-auto mb-3 text-gray-400" :size="40" />
					<p class="text-text-secondary mb-2">
						No execution history yet
					</p>
					<p class="text-sm text-text-secondary">
						Activate your flow to start collecting execution data
					</p>
				</div>
			</template>

			<!-- Custom item rendering slot -->
			<template #item="{ item }">
				<!-- Run ID -->
				<span v-if="item.id" class="font-medium text-headline">
					{{ item.data.id }}
				</span>

				<!-- Status -->
				<span v-else-if="item.status">
					<span
						:class="{
							'bg-emerald-100 text-emerald-800': item.data.status === 'completed',
							'bg-red-100 text-red-800': item.data.status === 'failed',
							'bg-yellow-100 text-yellow-800': item.data.status === 'scheduled',
							'bg-blue-100 text-blue-800': item.data.status === 'in-progress'
						}"
						class="px-2 py-1 rounded-full text-xs"
					>
						{{ item.data.status }}
					</span>
				</span>

				<!-- Start Time -->
				<span v-else-if="item.start_time" class="text-text-secondary">
					{{ formatDate(item.data.start_time) }}
				</span>

				<!-- Duration -->
				<span v-else-if="item.duration" class="text-text-secondary">
					{{ item.data.duration }}
				</span>

				<!-- Trigger -->
				<span v-else-if="item.trigger" class="text-text-secondary capitalize">
					{{ item.data.trigger }}
				</span>

				<!-- Steps -->
				<span v-else-if="item.steps" class="text-text-secondary">
					{{ item.data.steps_completed }}/{{ item.data.steps_total }}
					<span v-if="item.data.error" class="text-red ml-2 cursor-help inline-flex items-center" :title="item.data.error">
						<AlertCircle :size="14" />
					</span>
				</span>
			</template>
		</Table>
	</div>
</template>

<script setup lang="ts">
import { AlertCircle, RefreshCw, History } from 'lucide-vue-next'
import { formatDate } from '@/composables/utils/formatter'
import Table from '@/components/core/Table.vue'

// Define event emits
const emit = defineEmits(['refreshRuns'])

// Define Props
defineProps({
	flowRuns: {
		type: Array,
		default: () => []
	},
	loading: {
		type: Boolean,
		default: false
	}
})

// Define headers for the Table component
const tableHeaders = [
	{ text: 'Run ID', value: 'id' },
	{ text: 'Status', value: 'status' },
	{ text: 'Start Time', value: 'start_time' },
	{ text: 'Duration', value: 'duration' },
	{ text: 'Trigger', value: 'trigger' },
	{ text: 'Steps', value: 'steps' } // Use a generic value 'steps' for the combined column
]
</script>

<style scoped>
/* Styles are now mostly handled by the Table component or Tailwind classes */
</style>
