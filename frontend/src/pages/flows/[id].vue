<template>
	<div class="p-4 sm:p-6">
		<FlowsIdLoader v-if="loading" />

		<!-- Flow details -->
		<div v-else-if="flowData">
			<!-- Use the new Header component -->
			<FlowsIdHeader v-model:current-tab="currentTab" :flow-data="flowData" :flow-runs="flowRuns" />

			<!-- Use the Details component -->
			<FlowsIdDetails
				:current-tab="currentTab"
				:flow-data="flowData"
				:flow-runs="flowRuns"
				:flow-runs-loading="flowRunsLoading"
				@refresh-runs="fetchFlowRuns"
			/>
		</div>

		<FlowsIdErrorState v-else />
	</div>
</template>

<script setup lang="ts">
import { watch } from 'vue'
import FlowsIdHeader from '@/components/flows/id/Header.vue'
import FlowsIdDetails from '@/components/flows/id/Details.vue'
import FlowsIdLoader from '@/components/flows/id/Loader.vue'
import FlowsIdErrorState from '@/components/flows/id/ErrorState.vue'
import { useFetchUserFlows } from '@/composables/dashboard/flows/fetch'
import { useEditFlow } from '@/composables/dashboard/flows/edit'

const route = useRoute()
const flowId = route.params.id as string
const { fetchFlowById, loading, flowData } = useFetchUserFlows()
const { fetchFlowRuns, flowRuns, flowRunsLoading } = useEditFlow()

onMounted(async () => {
	await fetchFlowById(flowId)
	await fetchFlowRuns(flowId)
})

const currentTab = ref('editor')

// Function to refresh flow runs
const refreshFlowRuns = async () => {
  await fetchFlowRuns(flowId)
}

// Watch for tab changes to refresh runs when switching to the runs tab
watch(() => currentTab.value, (newTab) => {
  if (newTab === 'runs') {
    refreshFlowRuns()
  }
})



definePageMeta({
	layout: 'dashboard',
	middleware: ['is-authenticated']
})
</script>

