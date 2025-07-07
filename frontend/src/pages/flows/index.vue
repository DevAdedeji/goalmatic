<template>
	<section class="flex flex-col gap-4 center pt-6 px-4 md:px-9">
		<div class="flex justify-between items-center w-full">
			<div class="flex flex-col">
				<h1 class="md:text-2xl font-semibold ">
					Explore Workflow templates
				</h1>
				<p class="md:text-base text-xs font-medium text-[#666F8D]">
					Find the best workflows for your usecase
				</p>
			</div>
			<button class="btn-primary !px-3 md:px-6" @click="openCreateWorkflow">
				Create Workflow
			</button>
		</div>

		<div class="flex flex-col gap-4  w-full ">
			<!-- Controls Section -->
			<section class="controls flex flex-col-reverse md:flex-row md:justify-between gap-2">
				<div class="tabs">
					<button
						v-for="tab in tabs"
						:key="tab.id"
						class="tab-btn"
						:class="activeTab === tab.id ? 'active' : ''"
						@click="activeTab = tab.id"
					>
						{{ tab.name }}
					</button>
				</div>
				<div class="options w-full md:w-auto">
					<div class="relative w-full">
						<Search
							class="absolute left-3 top-[48%] transform -translate-y-1/2 size-4 text-gray-400"
						/>
						<input
							v-model="searchQuery"
							type="text"
							placeholder="Search workflows"
							class="searchInput md:min-w-[318px] w-full"
						>
					</div>
				</div>
			</section>

			<!-- Workflow Grid -->
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
					v-else-if="workflowsOnDisplay.length === 0"
					class="flex flex-col items-center justify-center py-8 px-4 text-center min-h-[200px]"
				>
					<div class="flex items-center justify-center size-12 bg-gray-100 rounded-full mb-3">
						<Activity class="size-6 text-gray-400" />
					</div>
					<h4 class="text-sm font-medium text-gray-700 mb-1">
						{{ searchQuery ? 'No workflows found' : 'No workflows available' }}
					</h4>
					<p class="text-xs text-gray-500 mb-4">
						{{ searchQuery
							? `No workflows match "${searchQuery}". Try adjusting your search.`
							: activeTab === 'my'
								? 'Create your first workflow to get started.'
								: 'No community workflows available at the moment.'
						}}
					</p>
					<button
						v-if="!searchQuery && activeTab === 'my'"
						class="btn-primary"
						@click="openCreateWorkflow"
					>
						Create Workflow
					</button>
					<button
						v-else-if="searchQuery"
						class="btn-outline text-xs px-3 py-1.5"
						@click="searchQuery = ''"
					>
						Clear Search
					</button>
				</div>

				<!-- Workflow Grid -->
				<div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
					<FlowCard v-for="(workflow, index) in workflowsOnDisplay" :key="workflow?.id || index" :flow="workflow" @edit="useRouter().push(`/flows/${workflow.id}`)" @delete="setDeleteFlowData" />
				</div>
			</div>
		</div>
	</section>
</template>

<script setup lang="ts">
import { Activity, FileEdit, Search } from 'lucide-vue-next'

import { usePageHeader } from '@/composables/utils/header'
import { useFetchUserFlows } from '@/composables/dashboard/flows/fetch'
import { useDeleteFlow } from '@/composables/dashboard/flows/delete'
import { useHeaderTitle } from '@/composables/core/headerTitle'
import { useFlowsModal } from '@/composables/core/modals'
import FlowCard from '@/components/flows/Card.vue'

interface Flow {
	id: string
	name: string
	description?: string
	status: number | string
	type: string
	steps: any[]
	trigger?: any
	creator_id: string
	creator_name?: string
	creator_avatar?: string
	created_at: any
	updated_at: any
	last_run?: any
	isValid: boolean
	usage_count?: number
	integrations?: Array<{
		name: string
		icon?: string
		count?: number
	}>
	cloned_from?: {
		id: string
		creator_id: string
		name: string
	}
}

definePageMeta({
	layout: 'dashboard'
})

// Reactive data
const searchQuery = ref('')
const activeTab = ref('my')

// Tabs configuration
const tabs = computed(() => [
	{ id: 'my', name: 'My Workflows' },
	{ id: 'community', name: 'Community Workflows' }
])

const { userFlows, loading, fetchAllFlows, activeFlows, draftFlows } = useFetchUserFlows()
const { setDeleteFlowData } = useDeleteFlow()
const { openCreateWorkflow } = useFlowsModal()

// Computed workflows on display
const workflowsOnDisplay = computed((): Flow[] => {
	let workflows: Flow[] = []
	if (activeTab.value === 'my') {
		workflows = userFlows.value as Flow[]
	} else if (activeTab.value === 'community') {
		// For now, community workflows are empty - this can be expanded later
		workflows = []
	}

	return workflows.filter((workflow: Flow) =>
		workflow.name?.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
		workflow.description?.toLowerCase().includes(searchQuery.value.toLowerCase())
	)
})

onMounted(async () => {
	await fetchAllFlows()
})

useHeaderTitle().setTitle('Workflow Templates')
</script>

<style scoped lang="postcss">
.controls {
	@apply flex items-center justify-between border-b border-[#E9EAEB] pb-5 mb-4;
	.options {
		@apply items-center gap-2;
	}
}

.tabs {
	@apply w-full md:w-auto flex items-start gap-2 rounded-lg bg-[#f9f8fb] p-1;

	.tab-btn {
		@apply w-full md:w-auto flex items-center justify-center font-medium p-2 gap-2.5 rounded-none text-xs text-[#19213d];

		&.active {
			border-radius: 4px;
			border: 1px solid #f0f2f5;
			background: #fcfcfd;
			box-shadow: 0px 1px 3px 0px rgba(25, 33, 61, 0.1);
			display: flex;
			padding: 8px;
			justify-content: center;
			align-items: center;
			gap: 10px;
		}
	}
}

.card-skeleton {
	@apply bg-[#FCFAFF] border border-[#EFE8FD] rounded-lg py-4 px-3.5;
}

.searchInput {
	@apply w-full px-3 py-2 pl-10 border border-gray-200 rounded-lg bg-white text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent;
}
</style>





