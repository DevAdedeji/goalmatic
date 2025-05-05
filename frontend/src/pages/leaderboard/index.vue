<template>
	<main class="p-4 sm:p-6">
		<LeaderboardHeader />

		<LeaderboardLoader v-if="loading" />
		<LeaderboardEmptyState v-else-if="!leaderboardData.length" />

		<LeaderboardList v-else :leaderboard-data="leaderboardData" />
	</main>
</template>

<script setup lang="ts">
import { Trophy } from 'lucide-vue-next'
import { usePageHeader } from '@/composables/utils/header'
import { useFetchLeaderboard } from '@/composables/dashboard/leaderboard/fetch'

const { leaderboardData, loading, fetchLeaderboard } = useFetchLeaderboard()

onMounted(async () => {
	await fetchLeaderboard()
})

definePageMeta({
	layout: 'dashboard',
	middleware: [() => {
		usePageHeader().setPageHeader({
			title: 'Leaderboard',
			description: 'See who has the most popular agents',
			shouldShowFab: false,
			shouldShowTab: usePageHeader().isLargeScreen.value
		})
	}]
})
</script>

<style scoped>
.loading-spinner {
	@apply w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin;
}

.loading-spinner.small {
	@apply w-4 h-4;
}
</style>
