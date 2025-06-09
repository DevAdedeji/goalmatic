<template>
	<section id="main1" class="flex flex-col items-center gap-4 md:gap-6 relative h-[calc(100vh-0px)] w-full  px-4 md:pt-8 pt-4 overflow-auto pb-20">
		<div class="flex items-center justify-start gap-2 border-line md:max-w-[var(--mw)] border p-4 rounded-xl bg-[#FCFCFD] w-full">
			<div class="assistant-avatar">
				<img class="size-5" src="/og.png" alt="goalmatic logo">
			</div>
			<span class="name-label">Goalmatic 1.0</span>
			<span class="default-pill">Default</span>
		</div>


		<div class="flex flex-col items-start justify-center gap-2  md:max-w-[var(--mw)] border-line border p-4 rounded-xl bg-[#F6F5FF] w-full">
			<span class="text-lg font-semibold">Hi {{ userProfile?.name }}! Welcome to Goalmatic! </span>
			<span class="text-sm text-subText">Goalmatic is a platform designed to make building agents and workflows as easy as possible. </span>
			<span class="text-sm text-subText italic font-bold">You can start by selecting an agent from the list below or create a new one.</span>
		</div>

		<div v-if="loading" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 w-full md:max-w-[var(--mw)]">
			<div v-for="i in 3" :key="i" class="bg-[#F5F7F9] flex flex-col border border-[#DCE3EA] rounded-xl">
				<div class="bg-light border-b border-[#EFE8FD] rounded-xl py-3 px-4">
					<div class="flex justify-between items-center mb-3.5">
						<Skeleton width="34px" height="34px" radius="50%" />
						<Skeleton width="60px" height="28px" radius="6px" />
					</div>
					<Skeleton width="70%" height="16px" radius="4px" class="mb-2" />
					<Skeleton width="90%" height="32px" radius="4px" />
				</div>
				<div class="py-3 px-4">
					<Skeleton width="50%" height="14px" radius="4px" />
				</div>
			</div>
		</div>

		<div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 w-full md:max-w-[var(--mw)]">
			<AgentCard v-for="(agent, index) in [defaultGoalmaticAgent, ...fetchedAllAgents]" :key="agent?.id || index" :agent="agent" />
		</div>
	</section>
</template>

<script setup lang="ts">
import { useUser } from '@/composables/auth/user'
import { useFetchAgents } from '@/composables/dashboard/assistant/agents/fetch'
import AgentCard from '@/components/agents/Card.vue'
import Skeleton from '@/components/core/skeleton.vue'

const { fetchAllAgents, fetchedAllAgents, defaultGoalmaticAgent, loading } = useFetchAgents()
const { userProfile } = useUser()
fetchAllAgents()

</script>

<style scoped lang="scss">

.shadow{
	box-shadow: 0px 8px 24px 0px #959DA533;
}
#main1, #main2 {
	scroll-padding: 10rem;
}
.message-container {
  @apply flex flex-col gap-2 w-full items-start;
}

.header-container {
  @apply flex gap-2 text-[#374151];
}

.user-avatar {
  @apply  flex size-[30px] shrink-0 select-none items-center justify-center rounded-full border shadow-sm;
}

.assistant-avatar {
  @apply bg-[#eaeaef] flex size-[30px] shrink-0 items-center justify-center rounded-full p-0.5;
}

.name-label {
  @apply  overflow-x-hidden font-semibold mt-0.5;
}

.message-bubble {
  @apply bg-[#F4F3FF] px-4 py-2 rounded-lg ml-9 w-auto border border-[#E4E7EC] md:leading-8 leading-7;
    p {
    @apply text-sm text-subText ;
  }
}


</style>

