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

				<!-- Expand control -->
				<span v-else-if="item.expand" class="flex justify-end">
					<button class="p-1 rounded hover:bg-gray-100" @click.stop="toggleExpand(item.data)">
						<ChevronDown :size="16" class="transition-transform duration-200" :class="expandedRunId === item.data.id ? 'rotate-180' : 'rotate-0'" />
					</button>
				</span>
			</template>

			<!-- Expanded row content -->
			<template #row-extra="{ data }">
				<div v-if="expandedRunId === data.id" class="bg-white border-t border-border">
					<div class="flex items-center justify-between px-6 py-3">
						<div class="text-sm text-text-secondary">
							Run ID: <span class="text-headline">{{ data.id }}</span>
							<span class="mx-2">•</span>
							Status: <span class="capitalize">{{ data.status }}</span>
							<span class="mx-2">•</span>
							Started: {{ formatDateTime(data.start_time) }}
							<span v-if="data.duration" class="mx-2">•</span>
							<span v-if="data.duration">Duration: {{ data.duration }}</span>
						</div>
						<button class="px-3 py-1 text-sm rounded-md border border-border hover:border-primary hover:text-primary transition-colors flex items-center gap-1"
							@click="copyLog(data)">
							<Copy :size="14" />
							Copy log
						</button>
					</div>
					<div class="px-6 pb-4">
						<div v-if="stepsByRunId[data.id]?.loading" class="text-sm text-text-secondary py-2">
							Loading...
						</div>
						<div v-else class="space-y-3">
							<div v-for="s in stepsByRunId[data.id]?.steps || []" :key="s.id" class="p-3 rounded-lg border border-border">
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
				</div>
			</template>
		</Table>
	</div>
</template>

<script setup lang="ts">
import { AlertCircle, RefreshCw, History, ChevronDown, Copy } from 'lucide-vue-next'
import { ref } from 'vue'
import { collection, getDocs, orderBy, query } from 'firebase/firestore'
import { formatDateTime } from '@/composables/utils/formatter'
import Table from '@/components/core/Table.vue'
import Modal from '@/components/core/modal/Modal.vue'
import { db } from '@/firebase/init'
import { useAlert } from '@/composables/core/notification'

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
	{ text: 'Steps', value: 'steps' },
	{ text: '', value: 'expand' }
]

const expandedRunId = ref<string | null>(null)
const stepsByRunId = ref<Record<string, { loading: boolean, steps: any[] }>>({})

const ensureStepsLoaded = async (runId: string) => {
  if (!stepsByRunId.value[runId]) {
    stepsByRunId.value[runId] = { loading: true, steps: [] }
    try {
      const flowId = useRoute().params.id as string
      const stepsRef = collection(db, 'flows', flowId, 'logs', runId, 'steps')
      const q = query(stepsRef, orderBy('started_at', 'asc'))
      const snap = await getDocs(q)
      stepsByRunId.value[runId].steps = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
    } catch (e) {
      console.error('Failed to load steps:', e)
    } finally {
      stepsByRunId.value[runId].loading = false
    }
  }
}

const toggleExpand = async (run: any) => {
  if (!run?.id) return
  expandedRunId.value = expandedRunId.value === run.id ? null : run.id
  if (expandedRunId.value) {
    await ensureStepsLoaded(run.id)
  }
}

const copyLog = async (run: any) => {
  try {
    const steps = stepsByRunId.value[run.id]?.steps || []
    const lines: string[] = []
    lines.push(`Run ID: ${run.id}`)
    lines.push(`Status: ${run.status}`)
    if (run.start_time) lines.push(`Started: ${formatDateTime(run.start_time)}`)
    if (run.duration) lines.push(`Duration: ${run.duration}`)
    lines.push('Steps:')
    for (const s of steps) {
      lines.push(`- ${s.name || s.node_id} [${s.status}]`)
      if (s.error) lines.push(`  Error: ${s.error}`)
      if (s.result_summary) lines.push(`  Result: ${s.result_summary}`)
    }
    const text = lines.join('\n')
    await navigator.clipboard.writeText(text)
    useAlert().openAlert({ type: 'SUCCESS', msg: 'Log copied to clipboard' })
  } catch (e) {
    console.error(e)
    useAlert().openAlert({ type: 'ERROR', msg: 'Failed to copy log' })
  }
}

// Keep modal utilities (no longer used) for compatibility if needed
const showStepsModal = ref(false)
const steps = ref<any[]>([])
const stepsLoading = ref(false)
const activeRun = ref<any | null>(null)

const onRowClicked = async (row: any) => {
  await toggleExpand(row)
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
