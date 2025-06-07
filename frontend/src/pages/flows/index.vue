<template>
	<!-- Coming Soon Section -->
	<div v-if="showComingSoon" class="flex flex-col items-center justify-center min-h-[50vh] text-center">
		<Construction class="text-primary mb-6 mt-40" :size="64" />
		<h1 class="text-3xl mb-4 text-headline font-bold">
			Coming Soon!
		</h1>
		<p class="text-text-secondary mb-8 text-lg max-w-md">
			We're working hard to bring this feature to you. Stay tuned for updates!
		</p>
	</div>

	<main v-else class="p-4 sm:p-6">
		<FlowsHeader :creating-flow="createLoading" @createNewFlow="createNewFlow" />



		<FlowsLoader v-if="loading" />
		<FlowsEmptyState v-else-if="!userFlows.length" @createNewFlow="createNewFlow" />

		<div v-else>
			<TabComponents
				:tabs="['active', 'draft']"
				:selected="currentTab"
				:icons="[Activity, FileEdit]"
				:counts="[activeFlows.length, draftFlows.length]"
				@changed="currentTab = $event"
			/>

			<FlowsList :current-tab="currentTab" :active-flows="activeFlows" :draft-flows="draftFlows" @edit="useRouter().push(`/flows/${$event.id}`)" @delete="setDeleteFlowData" @createNewFlow="createNewFlow" @currentTab="currentTab = $event" />
		</div>
	</main>
</template>

<script setup lang="ts">
import { Activity, FileEdit, Construction } from 'lucide-vue-next'

import { usePageHeader } from '@/composables/utils/header'
import { useFetchUserFlows } from '@/composables/dashboard/flows/fetch'
import { useDeleteFlow } from '@/composables/dashboard/flows/delete'
import { useCreateFlow } from '@/composables/dashboard/flows/create'
import TabComponents from '@/components/core/Tabs.vue'
import { is_dev } from '@/composables/utils/system'



// --- Add this ref to toggle the Coming Soon section ---
// Set to `true` to display the "Coming Soon" message, `false` to show the normal content.
const showComingSoon = ref(false)
// -------------------------------------------------------


const { userFlows, loading, fetchAllFlows, activeFlows, draftFlows } = useFetchUserFlows()
const { setDeleteFlowData } = useDeleteFlow()
const { loading: createLoading, createNewFlow } = useCreateFlow()


const currentTab = ref(activeFlows.value.length > 0 ? 'active' : 'draft')


onMounted(async () => {
	await fetchAllFlows()
})

definePageMeta({
	layout: 'dashboard',
	middleware: ['is-authenticated', () => {
		usePageHeader().setPageHeader({
			title: 'Flows',
			description: 'Manage your workflow automation',
			btnText: 'Create New Flow',
			btnCall: () => useRouter().push('/flows/create'),
			shouldShowFab: true,
			shouldShowTab: usePageHeader().isLargeScreen.value
		})
	}]
})
</script>


