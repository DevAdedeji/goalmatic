<template>
	<div class="w-full flex flex-col lg:flex-row flex-wrap justify-between items-center md:my-4 gap-4">
		<div class="w-full lg:w-[30%] flex justify-start">
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


		<article v-if="!isFlowValid && isOwner(flowData)" class="w-full lg:w-[35%] p-2.5 flex  justify-center items-center gap-4 rounded-lg border border-amber-200 text-amber-800 bg-amber-50">
			<AlertTriangle :size="18" />
			<span class="text-sm">Add a trigger and action to make your flow valid.</span>
		</article>

		<div class="gap-4 items-center flex-1  lg:w-[30%] hidden lg:flex justify-end">
			<!-- Flow Status Toggle -->
			<Tooltip v-if="isOwner(flowData) && !allNodesValid && flowData.status !== 1" placement="top">
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




			<Tooltip v-if="isOwner(flowData) && !allNodesValid" placement="top">
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
import { Workflow, ScrollText, AlertTriangle } from 'lucide-vue-next'
import { computed } from 'vue'
import { useEditFlow } from '@/composables/dashboard/flows/edit'
import { useFlowOwner } from '@/composables/dashboard/flows/owner'
import { useToggleFlow } from '@/composables/dashboard/flows/toggle'
import { useTestFlow } from '@/composables/dashboard/flows/test'
import { isNodeValid } from '@/composables/dashboard/flows/nodes/nodeOperations'
import Tooltip from '@/components/core/Tooltip.vue'
import Spinner from '@/components/core/Spinner.vue'

const { isFlowValid } = useEditFlow()
const { isOwner } = useFlowOwner()
const { toggleFlowStatus, loading: toggleLoading } = useToggleFlow()
const { testFlow, loading: testLoading } = useTestFlow()

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

// Check if all nodes in the flow are valid
const allNodesValid = computed(() => {
	// Must have a trigger
	if (!props.flowData.trigger) {
		return false
	}

	// Must have at least one action step
	if (!props.flowData.steps || props.flowData.steps.length === 0) {
		return false
	}

	// Check if trigger is valid
	if (!isNodeValid(props.flowData.trigger)) {
		return false
	}

	// Check if all action nodes are valid
	for (const step of props.flowData.steps) {
		if (!isNodeValid(step)) {
			return false
		}
	}

	return true
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

const tabs = [
	{ name: 'editor', icon: Workflow },
	{ name: 'logs', icon: ScrollText }
]
</script>

<style scoped>

</style>
