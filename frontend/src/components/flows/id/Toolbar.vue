<template>
	<div class="w-full flex flex-col lg:flex-row flex-wrap justify-between items-center md:my-4 gap-4">
		<div class="w-full xl:max-w-[320px] flex justify-start z-[1]">
			<div class="tabs border border-line ">
				<button
					v-for="tab in tabs"
					:key="tab.name"
					class="tab-btn !px-4 capitalize"
					:class="currentTab === tab.name ? 'active' : ''"
					@click="emit('update:currentTab', tab.name)"
				>
					<component :is="tab.icon" class="size-4" />
					{{ tab.name }}
				</button>
			</div>
		</div>

		<section class="static md:inset-x-0 w-auto justify-center flex z-0">
			<!-- Error State -->
			<article v-if="flowStatus === 'error'" class="w-full  p-2.5 flex justify-center items-center gap-4 rounded-lg border border-red-200 text-red-800 bg-red-50">
				<AlertTriangle :size="18" />
				<span class="text-sm">Error detected · One or more parts of your flow has an error.</span>
			</article>

			<!-- Invalid Flow State -->
			<article v-else-if="flowStatus === 'invalid'" class="w-full  p-2.5 flex justify-center items-center gap-4 rounded-lg border border-amber-200 text-amber-800 bg-amber-50">
				<AlertTriangle :size="18" />
				<span class="text-sm">
					{{
						invalidReason === 'no_trigger'
							? 'Add a trigger to start your flow.'
							: invalidReason === 'no_action'
								? 'Add at least one action step to your flow.'
								: invalidReason === 'invalid_trigger'
									? 'Configure the trigger to make your flow valid.'
									: 'Configure all required fields in your action steps to make your flow valid.'
					}}
				</span>
				<button class="btn-outline !px-3 !py-1 text-xs" :disabled="configLoading" @click="openConfigModal">
					<span v-if="!configLoading">Configure</span>
					<span v-else class="flex items-center gap-1"><Spinner size="14" class="animate-spin" /> Loading</span>
				</button>
			</article>

			<!-- Running State -->
			<article v-else-if="flowStatus === 'running'" class="w-full  p-2.5 flex justify-center items-center gap-4 rounded-lg border border-blue-200 text-blue-800 bg-blue-50">
				<Spinner size="18" class="animate-spin" />
				<span class="text-sm">Flow Running · Your flow is currently executing.</span>
			</article>

			<!-- Completed State -->
			<article v-else-if="flowStatus === 'completed'" class="w-full  p-2.5 flex justify-center items-center gap-4 rounded-lg border border-green-200 text-green-800 bg-green-50">
				<CheckCircle :size="18" />
				<span class="text-sm">Flow Completed · Your flow has executed successfully.</span>
			</article>

			<!-- Canceled State -->
			<article v-else-if="flowStatus === 'canceled'" class="w-full  p-2.5 flex justify-center items-center gap-4 rounded-lg border border-red-200 text-red-800 bg-red-50">
				<XCircle :size="18" />
				<span class="text-sm">Flow Canceled · This flow was stopped before completion.</span>
			</article>

			<!-- No Activity State -->
			<article v-else-if="flowStatus === 'idle'" class="w-full  p-2.5 flex justify-center items-center gap-4 rounded-lg border border-gray-200 text-gray-600 bg-gray-50">
				<span class="text-sm">No new activity · Your flow is running smoothly.</span>
			</article>
		</section>


		<div class="gap-4 items-center flex-1 w-full xl:max-w-[320px] hidden lg:flex justify-end z-[1]">
			<!-- Flow Status Toggle -->
			<Tooltip v-if="isOwner(flowData) && !canActivateFlow && flowData.status !== 1" placement="top">
				<template #trigger>
					<div class="btn-outline w-auto gap-2 cursor-not-allowed opacity-60 !px-4">
						{{ flowData.status === 1 ? 'Deactivate' : 'Activate' }} Flow
					</div>
				</template>
				<template #content>
					<div class="p-2 max-w-xs">
						<p>Cannot activate flow with invalid nodes. Please configure all required properties first.</p>
					</div>
				</template>
			</Tooltip>
			<div
				v-else-if="isOwner(flowData)"
				class="btn-outline w-auto gap-2 cursor-pointer"
				:class="{ 'opacity-60': toggleLoading }"
				@click="!toggleLoading && handleToggleFlow()"
			>
				<span v-if="!toggleLoading">
					{{ flowData.status === 1 ? 'Deactivate' : 'Activate' }} Flow
				</span>
				<span v-else class="flex items-center gap-2">
					<Spinner size="16" class="animate-spin" />
					Updating...
				</span>
			</div>




			<Tooltip v-if="isOwner(flowData) && !canRunTests" placement="top">
				<template #trigger>
					<button class="btn-outline cursor-not-allowed opacity-60 !px-4" disabled>
						Run Test
					</button>
				</template>
				<template #content>
					<div class="p-2 max-w-xs">
						<p>Cannot test flow with invalid nodes. Please configure all required properties first.</p>
					</div>
				</template>
			</Tooltip>
			<button
				v-else-if="isOwner(flowData)"
				class="btn-outline !px-4"
				:disabled="testLoading"
				@click="handleTestFlow"
			>
				<span v-if="!testLoading">Run Test</span>
				<span v-else class="flex items-center gap-2">
					<Spinner size="16" class="animate-spin" />
					Testing...
				</span>
			</button>
		</div>
	</div>
</template>

<script setup lang="ts">
import { Workflow, ScrollText, AlertTriangle, CheckCircle, XCircle } from 'lucide-vue-next'
import { computed } from 'vue'
import { useFlowOwner } from '@/composables/dashboard/flows/owner'
import { useToggleFlow } from '@/composables/dashboard/flows/toggle'
import { useTestFlow } from '@/composables/dashboard/flows/test'
import { isNodeValid } from '@/composables/dashboard/flows/nodes/nodeOperations'
import { useFlowsModal } from '@/composables/core/modals'
import { useFetchIntegrations } from '@/composables/dashboard/integrations/fetch'
import { checkFlowRequirements } from '@/composables/dashboard/flows/approval'
import Tooltip from '@/components/core/Tooltip.vue'
import Spinner from '@/components/core/Spinner.vue'

const { isOwner } = useFlowOwner()
const { toggleFlowStatus, loading: toggleLoading } = useToggleFlow()
const { testFlow, loading: testLoading } = useTestFlow()
const { fetchedIntegrations, fetchUserIntegrations } = useFetchIntegrations()

const props = defineProps({
	currentTab: {
		type: String,
		required: true,
		default: 'editor'
	 },
	flowData: {
		type: Object,
		required: true
	}
})

const emit = defineEmits(['update:currentTab'])

// Determine why the flow might be invalid (more granular messaging)
const invalidReason = computed<
    null | 'no_trigger' | 'no_action' | 'invalid_trigger' | 'invalid_action'
>(() => {
    // Missing trigger
    if (!props.flowData.trigger) return 'no_trigger'

    // Missing action step
    if (!props.flowData.steps || props.flowData.steps.length === 0) return 'no_action'

    // Invalid trigger configuration
    if (!isNodeValid(props.flowData.trigger)) return 'invalid_trigger'

    // Any invalid action node
    for (const step of props.flowData.steps) {
        if (!isNodeValid(step)) return 'invalid_action'
    }

    return null
})

// Check if all nodes in the flow are valid
const canActivateFlow = computed(() => invalidReason.value === null)

// Check if tests can be run (needs at least one valid node)
const canRunTests = computed(() => {
	// Check if trigger exists and is valid
	if (props.flowData.trigger && isNodeValid(props.flowData.trigger)) {
		return true
	}

	// Check if at least one action step exists and is valid
	if (props.flowData.steps && props.flowData.steps.length > 0) {
		for (const step of props.flowData.steps) {
			if (isNodeValid(step)) {
				return true
			}
		}
	}

	return false
})

// Determine the current flow status
const flowStatus = computed(() => {
    // If flow cannot be activated (missing nodes or invalid configuration), show invalid
    if (isOwner(props.flowData) && invalidReason.value !== null) {
        return 'invalid'
    }

	// If flow has errors (you can add error checking logic here)
	// This would typically check for execution errors or validation errors
	if (props.flowData.hasErrors) {
		return 'error'
	}

	// If flow is currently executing
	if (props.flowData.isRunning) {
		return 'running'
	}

	// If flow was canceled
	if (props.flowData.status === 'canceled' || props.flowData.lastExecution?.status === 'canceled') {
		return 'canceled'
	}

	// If flow completed successfully
	if (props.flowData.lastExecution?.status === 'completed') {
		return 'completed'
	}

	// If flow is active but no recent activity
	if (props.flowData.status === 1) {
		return 'idle'
	}

	// Default case - don't show any status
	return null
})

// Handle flow toggle
const handleToggleFlow = () => {
	toggleFlowStatus(props.flowData)
}

// Handle test flow
const handleTestFlow = () => {
	testFlow(props.flowData, () => {
		// Switch to the logs tab after successful test
		emit('update:currentTab', 'logs')
	})
}

const configLoading = computed(() => false)

const openConfigModal = async () => {
    await fetchUserIntegrations()
    const userIntegrations = fetchedIntegrations.value || []
    const { requirements } = checkFlowRequirements(props.flowData, userIntegrations)
    useFlowsModal().openCloneFlowApprovalModal({
        requirements,
        userIntegrations
    })
}

const tabs = [
	{ name: 'editor', icon: Workflow },
	{ name: 'logs', icon: ScrollText }
]
</script>

<style scoped>

</style>
