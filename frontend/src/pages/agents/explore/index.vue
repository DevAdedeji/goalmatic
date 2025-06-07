<template>
	<section class="flex flex-col gap-4 center pt-6 px-4 md:px-9">
		<div class="flex justify-between items-center w-full">
			<div class="flex flex-col">
				<h1 class="md:text-2xl font-semibold ">
					Explore Agent templates
				</h1>
				<p class="md:text-base text-xs font-medium text-[#666F8D]">
					Find the best agents for your usecase
				</p>
			</div>
			<button v-if="isLoggedIn" class="btn-primary" @click="useAssistantModal().openCreateAgent()">
				Create Agent
			</button>
		</div>

		<div class="flex flex-col gap-4  w-full ">
			<!-- Controls Section -->
			<section class="controls flex flex-col-reverse md:flex-row md:justify-between gap-2">
				<div class="tabs">
					<button
						v-for="tab in tabs"
						:key="tab.id"
						class="tab-btn"
						:class="activeTab === tab.id ? 'active' : ''"
						@click="activeTab = tab.id"
					>
						{{ tab.name }}
					</button>
				</div>
				<div class="options w-full md:w-auto">
					<div class="relative w-full">
						<Search
							class="absolute left-3 top-[48%] transform -translate-y-1/2 size-4 text-gray-400"
						/>
						<input
							v-model="searchQuery"
							type="text"
							placeholder="Search agents"
							class="searchInput md:min-w-[318px] w-full"
						>
					</div>
				</div>
			</section>

			<!-- Agent Grid -->
			<div class="mb-12 pt-2">
				<!-- Loading State -->
				<div v-if="loading" class="min-h-[200px]">
					<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
						<div v-for="i in 6" :key="i" class="flex flex-col card-skeleton">
							<Skeleton width="32px" height="32px" radius="6px" />
							<Skeleton width="70%" height="16px" radius="4px" class="mt-4 mb-2" />
							<Skeleton width="90%" height="12px" radius="4px" />
						</div>
					</div>
				</div>

				<!-- Empty State -->
				<div
					v-else-if="agentsOnDisplay.length === 0"
					class="flex flex-col items-center justify-center py-8 px-4 text-center min-h-[200px]"
				>
					<div class="flex items-center justify-center size-12 bg-gray-100 rounded-full mb-3">
						<User class="size-6 text-gray-400" />
					</div>
					<h4 class="text-sm font-medium text-gray-700 mb-1">
						{{ searchQuery ? 'No agents found' : 'No agents available' }}
					</h4>
					<p class="text-xs text-gray-500 mb-4">
						{{ searchQuery
							? `No agents match "${searchQuery}". Try adjusting your search.`
							: activeTab === 'my'
								? 'Create your first agent to get started.'
								: 'No community agents available at the moment.'
						}}
					</p>
					<button
						v-if="!searchQuery && activeTab === 'my' && isLoggedIn"
						class="btn-primary"
						@click="useAssistantModal().openCreateAgent()"
					>
						Create Agent
					</button>
					<button
						v-else-if="searchQuery"
						class="btn-outline text-xs px-3 py-1.5"
						@click="searchQuery = ''"
					>
						Clear Search
					</button>
				</div>

				<!-- Agent Grid -->
				<div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
					<AgentCard v-for="(agent, index) in agentsOnDisplay" :key="agent?.id || index" :agent="agent" />
				</div>
			</div>
		</div>
	</section>
</template>

<script setup>
import { Search, User } from 'lucide-vue-next'
import { useAssistantModal } from '@/composables/core/modals'
import { useUser } from '@/composables/auth/user'
import { useHeaderTitle } from '@/composables/core/headerTitle'
import { useFetchAgents, useFetchUserAgents } from '@/composables/dashboard/assistant/agents/fetch'
import AgentCard from '@/components/agents/Card.vue'

// Get user authentication status
const { isLoggedIn } = useUser()

definePageMeta({
	layout: 'dashboard'
})

// Reactive data
const searchQuery = ref('')
const activeTab = isLoggedIn.value ? ref('my') : ref('community')

// Tabs configuration
const tabs = computed(() => {
	const baseTabs = []
	if (isLoggedIn.value) {
		baseTabs.push({ id: 'my', name: 'My Agents' })
	}
	baseTabs.push({ id: 'community', name: 'Community Agents' })
	return baseTabs
})

// Fetch agents data
const { loading: loadingAll, fetchedAllAgents, fetchAllAgents, defaultGoalmaticAgent } = useFetchAgents()
const { loading: loadingUser, fetchedUserAgents, fetchUserAgents, user_id } = useFetchUserAgents()

// Computed loading state
const loading = computed(() => {
	if (activeTab.value === 'all') {
		return loadingAll.value
	} else if (activeTab.value === 'my') {
		return loadingUser.value
	}
	return false
})

const communityAgents = computed(() => {
	return fetchedAllAgents.value.filter(
		(agent) => agent.creator_id !== user_id.value
	)
})

const agentsOnDisplay = computed(() => {
	const returnedAgent = ref([])
	if (activeTab.value === 'my') {
		returnedAgent.value = fetchedUserAgents.value
	} else if (activeTab.value === 'community') {
		returnedAgent.value = [defaultGoalmaticAgent, ...communityAgents.value]
	}
	return returnedAgent.value.filter((agent) => agent.name.toLowerCase().includes(searchQuery.value.toLowerCase()))
})

// Fetch agents on mount
onMounted(() => {
	fetchAllAgents()
	if (isLoggedIn.value) {
		fetchUserAgents()
	}
})


useHeaderTitle().setTitle('Agent Templates')
</script>

<style scoped lang="postcss">
.controls {
	@apply flex items-center justify-between border-b border-[#E9EAEB] pb-5 mb-4;
	.options {
		@apply items-center gap-2;
	}
}

.tabs {
	@apply w-full md:w-auto flex items-start gap-2 rounded-lg bg-[#f9f8fb] p-1;

	.tab-btn {
		@apply w-full md:w-auto flex items-center justify-center font-medium p-2 gap-2.5 rounded-none text-xs text-[#19213d];

		&.active {
			border-radius: 4px;
			border: 1px solid #f0f2f5;
			background: #fcfcfd;
			box-shadow: 0px 1px 3px 0px rgba(25, 33, 61, 0.1);
			display: flex;
			padding: 8px;
			justify-content: center;
			align-items: center;
			gap: 10px;
		}
	}
}



.card-skeleton {
	@apply bg-[#FCFAFF] border border-[#EFE8FD] rounded-lg py-4 px-3.5;
}

.input-field {
	@apply w-full px-3 py-2 border border-gray-200 rounded-lg bg-white text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent;
}
</style>


