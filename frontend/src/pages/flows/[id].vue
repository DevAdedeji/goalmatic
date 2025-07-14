<template>
	<ClientOnly>
		<NuxtLayout name="custom-header-dashboard">
			<template #header>
				<FlowHeader />
			</template>

			<main class="p-4 sm:p-6 flow-bg h-screen">
				<FlowsIdToolbar :current-tab="currentTab" :flow-data="flowDetails" @update:current-tab="currentTab = $event" />
				<FlowsIdLoader v-if="loading" />

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
import { watch } from 'vue'
import FlowHeader from '@/components/layouts/header/FlowHeader.vue'
import FlowsIdHeader from '@/components/flows/id/Header.vue'
import FlowsIdDetails from '@/components/flows/id/Details.vue'
import FlowsIdLoader from '@/components/flows/id/Loader.vue'
import FlowsIdErrorState from '@/components/flows/id/ErrorState.vue'
import { useFetchFlowById } from '@/composables/dashboard/flows/id'
import { useEditFlow } from '@/composables/dashboard/flows/edit'
import { useCustomHead } from '@/composables/core/head'

const route = useRoute()
const flowId = route.params.id as string
const { fetchFlowById, loading, flowDetails } = useFetchFlowById()
const { fetchFlowLogs, flowLogs, flowLogsLoading } = useEditFlow()

onMounted(async () => {
	await fetchFlowById(flowId)
	await fetchFlowLogs(flowId)
})

// Add SEO meta tags
await useCustomHead({
	title: `${flowDetails.value?.name || 'Flow'} | Flow Details`,
	desc: flowDetails.value?.description || 'View flow details and automation steps',
	img: 'https://www.goalmatic.io/og2.png'
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
