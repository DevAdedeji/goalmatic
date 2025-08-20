<template>
	<div class="mt-6 bg-light rounded-xl border border-line">
		<div class="flex justify-between items-center p-4">
			<h2 class="text-xl font-medium text-headline">
				Logs
			</h2>
			<button
				class="px-3 py-1 text-sm rounded-md border border-border hover:border-primary hover:text-primary transition-colors flex items-center gap-1"
				@click="emit('refreshLogs')"
			>
				<RefreshCw :size="14" />
				Refresh
			</button>
		</div>

		<!-- Use Table component -->
		<Table
			:headers="tableHeaders"
			:table-data="flowLogs"
			:loading="loading"
			:checkbox="false"
			:has-overflow="true"
			:max-height="'70vh'"
			:is-clickable="true"
			@rowClicked="onRowClicked"
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
							'bg-danger-100 text-danger-800': item.data.status === 'failed',
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
					{{ formatDateTime(item.data.start_time) }}
				</span>

				<!-- Duration -->
				<span v-else-if="item.duration" class="text-text-secondary">
					{{ item.data.duration }}
				</span>

				<!-- Trigger -->
				<span v-else-if="item.trigger" class="text-text-secondary capitalize">
					<ColorBadge :name="item.data.trigger" class="border-none !bg-line" />


				</span>

				<!-- Steps -->
				<span v-else-if="item.steps" class="text-text-secondary">
					{{ item.data.steps_completed }}/{{ item.data.steps_total }}
					<span v-if="item.data.error" class="text-danger ml-2 cursor-help inline-flex items-center" :title="item.data.error">
						<AlertCircle :size="14" />
					</span>
				</span>
			</template>
			<template #footer>
				<Modal
					v-if="showStepsModal && activeRun"
					type="sidebar"
					size="xl"
					title="Execution Steps"
					@close="closeStepsModal"
				>
					<div class="space-y-3">
						<div class="text-sm text-text-secondary">
							Run ID: <span class="text-headline">{{ activeRun.id }}</span>
						</div>
						<div class="text-sm text-text-secondary">
							Status: <span class="capitalize">{{ activeRun.status }}</span>
						</div>
						<div class="text-sm text-text-secondary">
							Started: {{ formatDateTime(activeRun.start_time) }}
						</div>
						<div class="text-sm text-text-secondary">
							Duration: {{ activeRun.duration || '-' }}
						</div>
					</div>
					<div class="mt-4">
						<div class="text-sm font-medium text-headline mb-2">
							Steps
						</div>
						<div v-if="stepsLoading" class="text-sm text-text-secondary">
							Loading...
						</div>
						<div v-else class="space-y-2">
							<div v-for="s in steps" :key="s.id" class="p-3 rounded-lg border border-border">
								<div class="flex items-center justify-between">
									<div class="font-medium text-headline">
										{{ s.name || s.node_id }}
									</div>
									<span :class="{
										'bg-emerald-100 text-emerald-800': s.status === 'completed',
										'bg-danger-100 text-danger-800': s.status === 'failed',
										'bg-yellow-100 text-yellow-800': s.status === 'running'
									}" class="px-2 py-1 rounded-full text-xs">{{ s.status }}</span>
								</div>
								<div class="mt-1 text-xs text-text-secondary">
									<span>Type: {{ s.type }}</span>
									<span class="mx-2">•</span>
									<span>Index: {{ s.index }}</span>
								</div>
								<div class="mt-1 text-xs text-text-secondary">
									<span>Started: {{ formatDateTime(s.started_at) }}</span>
									<span v-if="s.ended_at" class="mx-2">•</span>
									<span v-if="s.ended_at">Ended: {{ formatDateTime(s.ended_at) }}</span>
									<span v-if="s.duration" class="mx-2">•</span>
									<span v-if="s.duration">Duration: {{ s.duration }}</span>
								</div>
								<div v-if="s.error" class="mt-2 text-xs text-danger">
									Error: {{ s.error }}
								</div>
								<details class="mt-2">
									<summary class="text-xs text-text-secondary cursor-pointer">
										Result
									</summary>
									<pre class="text-xs mt-1 overflow-x-auto whitespace-pre-wrap break-words">{{ s.result_summary }}</pre>
								</details>
							</div>
						</div>
					</div>
				</Modal>
			</template>
		</Table>
	</div>
</template>

<script setup lang="ts">
import { AlertCircle, RefreshCw, History } from 'lucide-vue-next'
import { ref } from 'vue'
import { collection, getDocs, orderBy, query } from 'firebase/firestore'
import { formatDateTime } from '@/composables/utils/formatter'
import Table from '@/components/core/Table.vue'
import Modal from '@/components/core/modal/Modal.vue'
import { db } from '@/firebase/init'

// Define event emits
const emit = defineEmits(['refreshLogs'])

// Define Props
const props = defineProps<{
  flowLogs: any[]
  loading: boolean
}>()

// Define headers for the Table component
const tableHeaders = [
	{ text: 'Run ID', value: 'id' },
	{ text: 'Status', value: 'status' },
	{ text: 'Start Time', value: 'start_time' },
	{ text: 'Duration', value: 'duration' },
	{ text: 'Trigger', value: 'trigger' },
	{ text: 'Steps', value: 'steps' } // Use a generic value 'steps' for the combined column
]

const showStepsModal = ref(false)
const steps = ref<any[]>([])
const stepsLoading = ref(false)
const activeRun = ref<any | null>(null)

const onRowClicked = async (row: any) => {
  const data = row
  if (!data?.id) return
  const run = props.flowLogs.find((l) => l.id === data.id)?.data || null
  activeRun.value = run
  steps.value = []
  stepsLoading.value = true
  showStepsModal.value = true
  try {
    const flowId = useRoute().params.id as string
    const stepsRef = collection(db, 'flows', flowId, 'logs', data.id, 'steps')
    const q = query(stepsRef, orderBy('started_at', 'asc'))
    const snap = await getDocs(q)
    steps.value = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
  } catch (e) {
    console.error('Failed to load steps:', e)
  } finally {
    stepsLoading.value = false
  }
}

const closeStepsModal = () => {
  showStepsModal.value = false
  activeRun.value = null
  steps.value = []
}
</script>

<style scoped>
/* Styles are now mostly handled by the Table component or Tailwind classes */
</style>
