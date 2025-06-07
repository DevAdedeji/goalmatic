<template>
	<ClientOnly>
		<NuxtLayout name="custom-header-dashboard">
			<AssistantChat />
			<template #header>
				<AgentHeader />
			</template>
		</NuxtLayout>
	</ClientOnly>
</template>

<script setup>
import AgentHeader from '@/components/layouts/header/AgentHeader.vue'
import { usePageHeader } from '@/composables/utils/header'

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
