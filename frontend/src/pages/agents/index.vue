<template>
	<NuxtLayout name="custom-header-dashboard">
		<AssistantChat v-if="hasSelectedAgent" />
		<NoSelectedAgent v-else />
		<template #header>
			<AgentHeader />
		</template>
	</NuxtLayout>
</template>

<script setup>
import AgentHeader from '@/components/layouts/header/AgentHeader.vue'
import NoSelectedAgent from '@/components/assistant/NoSelectedAgent.vue'
import { usePageHeader } from '@/composables/utils/header'
import { useHasSelectedAgent } from '@/composables/dashboard/assistant/agents/fetch'

const { hasSelectedAgent } = useHasSelectedAgent()

definePageMeta({
    layout: false,
    middleware: ['is-authenticated', () => {
        usePageHeader().setPageHeader({
            title: 'Assistant',
            description: 'Your personal AI assistant'
        })
    }]
})

</script>

<style lang="scss" scoped>

</style>
