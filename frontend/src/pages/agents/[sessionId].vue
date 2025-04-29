<template>
	<div>
		<AssistantChat />
	</div>
</template>

<script setup>
import { usePageHeader } from '@/composables/utils/header'


definePageMeta({
    layout: 'dashboard',
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
