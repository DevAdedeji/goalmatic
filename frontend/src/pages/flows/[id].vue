<template>
	<ClientOnly>
		<NuxtLayout name="custom-header-dashboard">
			<template #header>
				<FlowHeader v-if="isOwner(flowDetails)" />
				<DashboadHeader v-else />
			</template>

			<main :class="['p-4 sm:p-6 h-screen overflow-y-auto', { 'flow-bg': isOwner(flowDetails) }]">
				<section class="flex flex-col gap-4 center pt-4  md:px-10 2xl:max-w-5xl max-w-7xl mx-auto w-full">
					<FlowsIdHeader v-if="!isOwner(flowDetails) && flowDetails.id" :flow-data="flowDetails" :loading="loading" />
				</section>

				<FlowsIdToolbar v-if="isOwner(flowDetails)" :current-tab="currentTab" :flow-data="flowDetails" @update:current-tab="currentTab = $event" />
				<section v-if="loading" class="flex flex-col gap-4 pt-10 px-4 md:px-10 w-full max-w-5xl mx-auto">
					<FlowsIdLoader />
				</section>

				<!-- Flow details -->
				<div v-else-if="flowDetails && Object.keys(flowDetails).length > 0">
					<!-- Use the Details component -->
					<FlowsIdDetails
						:current-tab="currentTab"
						:flow-data="flowDetails"
						:flow-logs="flowLogs"
						:flow-logs-loading="flowLogsLoading"
						@refresh-logs="refreshFlowLogs"
					/>
				</div>

				<FlowsIdErrorState v-else />
			</main>
		</NuxtLayout>
	</ClientOnly>
</template>

<script setup lang="ts">
import { watch, computed } from 'vue'
import FlowHeader from '@/components/layouts/header/FlowHeader.vue'
import DashboadHeader from '@/components/layouts/DashboadHeader.vue'
import FlowsIdHeader from '@/components/flows/id/Header.vue'
import FlowsIdDetails from '@/components/flows/id/Details.vue'
import FlowsIdLoader from '@/components/flows/id/Loader.vue'
import FlowsIdErrorState from '@/components/flows/id/ErrorState.vue'
import { useFetchFlowById } from '@/composables/dashboard/flows/id'
import { useEditFlow } from '@/composables/dashboard/flows/edit'
import { useFlowOwner } from '@/composables/dashboard/flows/owner'
import { useHeaderTitle } from '@/composables/core/headerTitle'
import { useFetchAgents } from '@/composables/dashboard/assistant/agents/fetch'
const route = useRoute()
const flowId = route.params.id as string
const { fetchFlowById, loading, flowDetails } = useFetchFlowById()
const { fetchFlowLogs, flowLogs, flowLogsLoading } = useEditFlow()
const { isOwner } = useFlowOwner()

onMounted(async () => {
	await fetchFlowById(flowId)
	await fetchFlowLogs(flowId)
  // Fetch agents so we can resolve agent names when only an ID is stored
  await fetchAllAgents()
})

useHeaderTitle().setTitle('Flows')

// Agent-derived meta (from flow steps)
const { fetchAllAgents, fetchedAllAgents } = useFetchAgents()

const agentFromFlow = computed(() => {
	const summary = (flowDetails.value as any)?.agentSummary
	if (summary?.name) return { name: summary.name, description: summary.description }
	const steps = (flowDetails.value as any)?.steps || []
	for (const step of steps) {
		if (step?.node_id === 'ASK_AGENT' && step?.propsData?.selectedAgent) {
			const sel = step.propsData.selectedAgent
			if (typeof sel === 'object') {
				return { name: sel.name, description: sel.description }
			}
			const found = fetchedAllAgents.value.find((a: any) => a.id === sel)
			if (found) return { name: found.name, description: found.description }
		}
	}
	return null
})

// Reactive SEO meta: prefer agent name/description when available
useSeoMeta({
	title: () => agentFromFlow.value?.name || `${(flowDetails.value as any)?.name || 'Flow'} | Flow Details`,
	description: () => agentFromFlow.value?.description || (flowDetails.value as any)?.description || 'View flow details and automation steps',
	ogTitle: () => agentFromFlow.value?.name || `${(flowDetails.value as any)?.name || 'Flow'} | Flow Details`,
	ogDescription: () => agentFromFlow.value?.description || (flowDetails.value as any)?.description || 'View flow details and automation steps',
	ogImage: 'https://www.goalmatic.io/og2.png',
	twitterCard: 'summary_large_image'
})

const currentTab = ref('editor')

// Function to refresh flow logs
const refreshFlowLogs = async () => {
  await fetchFlowLogs(flowId)
}

// Watch for tab changes to refresh logs when switching to the logs tab
watch(() => currentTab.value, (newTab) => {
  if (newTab === 'logs') {
    refreshFlowLogs()
  }
})



definePageMeta({
    layout: false
})
</script>

<style>

</style>
