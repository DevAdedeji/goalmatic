<template>
	<div class="agent-header-container">
		<header class="flex flex-col gap-4 lg:flex-row w-full items-center justify-between py-4 md:px-5 px-4 bg-transparent border-b border-[#E9E9E9]">
			<section class="flex items-center justify-between w-full gap-4">
				<div class="relative">
					<DropdownMenuRoot :modal="false">
						<DropdownMenuTrigger as-child>
							<button class="font-bold flex gap-1 items-center hover:bg-gray-50 px-2 py-1 rounded-md transition-colors">
								{{ flowDetails.name }} <ChevronDown :size="16" />
							</button>
						</DropdownMenuTrigger>

						<DropdownMenuContent align="start" class="z-10">
							<div class="start-0 z-10 mt-1 rounded-md border border-line bg-white shadow-lg w-52" role="menu">
								<div class="p-2 gap-0.5 flex flex-col items-start w-full">
									<button
										class="flex items-center rounded-md px-4 py-2 text-sm text-dark hover:bg-gray-100 w-full text-start border border-light"
										role="menuitem"
										@click="handleEditFlow"
									>
										<Edit2 :size="16" class="mr-2" />
										Edit Flow Details
									</button>
									<button
										class="flex items-center rounded-md px-4 py-2 text-sm text-dark hover:bg-gray-100 w-full text-start border border-light"
										role="menuitem"
										@click="handleToggleVisibility"
									>
										<EyeClosed v-if="flowDetails?.public" :size="16" class="mr-2" />
										<Eye v-else :size="16" class="mr-2" />
										Make {{ flowDetails?.public ? 'Private' : 'Public' }}
									</button>
									<button
										class="flex items-center rounded-md px-4 py-2 text-sm text-red-600 hover:bg-red-50 w-full text-start border border-light"
										role="menuitem"
										@click="handleDeleteFlow"
									>
										<Trash2 :size="16" class="mr-2" />
										Delete Flow
									</button>
								</div>
							</div>
						</DropdownMenuContent>
					</DropdownMenuRoot>
				</div>





				<button class="btn-primary gap-2 !px-4 md:!px-6" :disabled="saveLoading" @click="saveFlow">
					<File v-if="!saveLoading" :size="16" />
					<Spinner v-else size="16" class="animate-spin" />
					<span class="flex">{{ saveLoading ? 'Saving...' : 'Save' }}</span>
				</button>
			</section>


			<div class="flex gap-2 w-full lg:hidden justify-end">
				<Tooltip v-if="isOwner(flowDetails) && !canActivateFlow && flowDetails.status !== 1" placement="bottom">
					<template #trigger>
						<div class="flex-1 btn-outline w-full gap-2 cursor-not-allowed opacity-60  text-xs">
							{{ flowDetails.status === 1 ? 'Deactivate' : 'Activate' }}
						</div>
					</template>
					<template #content>
						<div class="p-2 max-w-xs">
							<p>Cannot activate flow with invalid nodes. Please configure all required properties first.</p>
						</div>
					</template>
				</Tooltip>
				<div
					v-else-if="isOwner(flowDetails)"
					class="btn-outline w-auto gap-2 cursor-pointer  text-xs flex-1"
					:class="{ 'opacity-60': toggleLoading }"
					@click="!toggleLoading && handleToggleFlow()"
				>
					<span v-if="!toggleLoading">
						{{ flowDetails.status === 1 ? 'Deactivate' : 'Activate' }}
					</span>
					<span v-else class="flex items-center gap-1">
						<Spinner size="12" class="animate-spin" />
						...
					</span>
				</div>

				<Tooltip v-if="isOwner(flowDetails) && !canRunTests" placement="bottom">
					<template #trigger>
						<button class="btn-outline cursor-not-allowed opacity-60  text-xs flex-1 w-full" disabled>
							Test
						</button>
					</template>
					<template #content>
						<div class="p-2 max-w-xs">
							<p>Cannot test flow with invalid nodes. Please configure all required properties first.</p>
						</div>
					</template>
				</Tooltip>
				<button
					v-else-if="isOwner(flowDetails)"
					class="btn-outline  text-xs flex-1"
					:disabled="testLoading"
					@click="handleTestFlow"
				>
					<span v-if="!testLoading">Run Test</span>
					<span v-else class="flex items-center gap-1">
						<Spinner size="12" class="animate-spin" />
						...
					</span>
				</button>
			</div>
		</header>
	</div>
</template>

<script setup lang="ts">
import { File, ChevronDown, Edit2, Trash2, Eye, EyeClosed } from 'lucide-vue-next'
import { computed } from 'vue'
import { DropdownMenuRoot, DropdownMenuTrigger, DropdownMenuContent } from 'radix-vue'

import { useFetchFlowById } from '@/composables/dashboard/flows/id'
import { useFlowOwner } from '@/composables/dashboard/flows/owner'
import { useToggleFlow } from '@/composables/dashboard/flows/toggle'
import { useTestFlow } from '@/composables/dashboard/flows/test'
import { useEditFlow } from '@/composables/dashboard/flows/edit'
import { useDeleteFlow } from '@/composables/dashboard/flows/delete'
import { useFlowsModal } from '@/composables/core/modals'
import { isNodeValid } from '@/composables/dashboard/flows/nodes/nodeOperations'
import Tooltip from '@/components/core/Tooltip.vue'
import Spinner from '@/components/core/Spinner.vue'

const { flowDetails } = useFetchFlowById()
const { isOwner } = useFlowOwner()
const { toggleFlowStatus, loading: toggleLoading } = useToggleFlow()
const { testFlow, loading: testLoading } = useTestFlow()
const { saveFlow, loading: saveLoading, openVisibilityConfirmation } = useEditFlow()
const { setDeleteFlowData } = useDeleteFlow()
const { openCreateWorkflow } = useFlowsModal()


// Handle edit flow
const handleEditFlow = () => {
	// Open the create workflow modal in edit mode with current flow data
	openCreateWorkflow({ mode: 'edit', flowData: flowDetails.value })
}

// Handle delete flow
const handleDeleteFlow = () => {
	setDeleteFlowData(flowDetails.value, () => {
		// Navigate to flows page after successful deletion
		useRouter().push('/flows')
	})
}

// Handle visibility toggle
const handleToggleVisibility = () => {
	openVisibilityConfirmation(flowDetails.value)
}



// Check if the flow can be activated
const canActivateFlow = computed(() => {
	// Must have a trigger
	if (!flowDetails.value.trigger) {
		return false
	}

	// Must have at least one action step
	if (!flowDetails.value.steps || flowDetails.value.steps.length === 0) {
		return false
	}

	// Check if trigger is valid
	if (!isNodeValid(flowDetails.value.trigger)) {
		return false
	}

	// Check if all action nodes are valid
	for (const step of flowDetails.value.steps) {
		if (!isNodeValid(step)) {
			return false
		}
	}

	return true
})

// Check if the flow can be tested (needs at least one valid node)
const canRunTests = computed(() => {
	// Check if trigger exists and is valid
	if (flowDetails.value.trigger && isNodeValid(flowDetails.value.trigger)) {
		return true
	}

	// Check if at least one action step exists and is valid
	if (flowDetails.value.steps && flowDetails.value.steps.length > 0) {
		for (const step of flowDetails.value.steps) {
			if (isNodeValid(step)) {
				return true
			}
		}
	}

	return false
})

// Handle flow toggle
const handleToggleFlow = () => {
	toggleFlowStatus(flowDetails.value)
}

// Handle test flow
const handleTestFlow = () => {
	testFlow(flowDetails.value, () => {
		// Could emit an event or use a store to switch tabs if needed
		console.log('Flow test completed')
	})
}
</script>

<style scoped lang="scss">
:deep(.tooltip-trigger) {
	display: flex !important;
}
:deep(.tooltip-container) {
	flex: 1 !important;
}

.agent-header-container {
	position: relative;
}

.btn-group {
	@apply flex gap-4;
	button {
		@apply p-2.5 md:px-6 md:py-[11px];
		transition: all 0.2s ease;

		&.active {
			@apply bg-primary text-white;
			transform: scale(0.98);
		}

		&:hover {
			transform: translateY(-1px);
		}

		&:active {
			transform: scale(0.96);
		}
	}
}





.default-pill {
	@apply bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs ml-2;
}


</style>
