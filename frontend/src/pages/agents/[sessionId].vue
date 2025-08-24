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

// Set canonical URL to main agents page to prevent duplicate content issues
useSeoMeta({
	title: 'AI Assistant - Goalmatic',
	description: 'Your personal AI assistant powered by Goalmatic. Get more done effortlessly with AI agents and workflows.',
	ogTitle: 'AI Assistant - Goalmatic',
	ogDescription: 'Your personal AI assistant powered by Goalmatic. Get more done effortlessly with AI agents and workflows.',
	ogImage: 'https://www.goalmatic.io/og2.png',
	twitterCard: 'summary_large_image',
	link: [
		{ rel: 'canonical', href: 'https://goalmatic.io/agents' }
	]
})

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
