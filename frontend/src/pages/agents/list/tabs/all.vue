<template>
	<div v-if="loading" class="min-h-[200px]">
		<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
			<div v-for="i in 3" :key="i" class="flex flex-col bg-[#FCFAFF] border border-[#EFE8FD] rounded-lg py-4 px-3.5">
				<Skeleton width="32px" height="32px" radius="6px" />
				<Skeleton width="70%" height="16px" radius="4px" class="mt-4 mb-2" />
				<Skeleton width="90%" height="12px" radius="4px" />
			</div>
		</div>
	</div>

	<div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
		<div v-for="(agent, index) in [defaultGoalmaticAgent, ...agents]" :key="agent?.id || index" class="flex flex-col card" @click="$router.push(`/agents/list/${agent?.id || 0}`)">
			<img src="/bot.png" alt="agent">
			<h2 class="text-sm font-semibold text-headline mt-4 mb-2">
				{{ agent?.name || 'Unnamed Agent' }}
			</h2>
			<p class="text-xs text-subText">
				{{ agent?.description || 'No description available' }}
			</p>
		</div>
	</div>
</template>

<script setup lang="ts">
import { useFetchAgents } from '@/composables/dashboard/assistant/agents/fetch'

const { loading, fetchedAllAgents, fetchAllAgents, defaultGoalmaticAgent } = useFetchAgents()
const agents = fetchedAllAgents

onMounted(() => {
	fetchAllAgents()
})
</script>

<style scoped lang="scss">
.card{
	@apply bg-[#FCFAFF] border border-[#EFE8FD] rounded-lg py-4 px-3.5 cursor-pointer;
	img{
		@apply size-8 border border-[#EFE8FD] rounded-md;
	}
}
</style>
