<template>
	<div class="relative w-full z-[4]" @click.stop>
		<ClientOnly>
			<DropdownMenuRoot v-slot="{open}" v-model:open="isOpen">
				<DropdownMenuTrigger
					class="dropdownBtn"
					:class="{'!border-primary': open}"
				>
					<img src="/og.png" alt="agent" class="size-3.5">
					<span class="text-xs font-medium text-dark">{{
						selectedAgent.name
					}}</span>
					<ChevronDown class="size-4" />
				</DropdownMenuTrigger>

				<DropdownMenuPortal>
					<DropdownMenuContent align="start" class="dropdownBtnContent">
						<!-- Header -->
						<div
							class="flex items-center justify-between mb-6 border-b border-[#E9EAEB] pb-5"
						>
							<h2 class="text-lg font-semibold text-dark">
								Choose your agent
							</h2>
							<button
								class="p-1 hover:bg-gray-100 rounded-md"
								@click="closeDropdown"
							>
								<X class="size-5 text-gray-500" />
							</button>
						</div>

						<!-- Search Bar -->
						<div class="relative mb-4">
							<Search
								class="absolute left-3 top-[48%] transform -translate-y-1/2 size-4 text-gray-400"
							/>
							<input
								v-model="searchQuery"
								type="text"
								placeholder="Search your agents"
								class="input-field pl-10"
							>
						</div>

						<section class="controls">
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
							<div class="options hidden md:flex">
								<button class="btn-primary" @click="createNewAgent">
									New Agent
								</button>
								<button class="btn-outline" @click="createNewAgent">
									Agent Library
								</button>
							</div>
						</section>

						<div class="flex flex-col gap-4 overflow-y-auto mb-20 md:mb-0">
							<h3 class="text-sm font-medium text-gray-700">
								Recently used
							</h3>
							<div class="flex flex-col gap-2">
								<!-- Empty state when no agents are found -->
								<div
									v-if="agentOnDisplay.length === 0"
									class="flex flex-col items-center justify-center py-8 px-4 text-center"
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
										v-if="!searchQuery && activeTab === 'my'"
										class="btn-primary text-xs px-3 py-1.5"
										@click="createNewAgent"
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

								<!-- Agent list when agents are available -->
								<div
									v-for="agent in agentOnDisplay"
									:key="agent.id"
									class="flex items-center gap-3 px-1 py-2 hover:bg-gray-100 transition-colors cursor-pointer border-b border-[#F0F2F5]"
									@click="handleAgentClick(agent)"
								>
									<div
										class="flex items-center justify-center size-8 bg-purple-100 rounded-full"
									>
										<img
											:src="agent.avatar || '/og.png'"
											:alt="agent.name"
											class="size-5"
										>
									</div>
									<div class="flex-1 min-w-0">
										<p class="text-sm font-semibold text-dark truncate">
											{{ agent.name }}
										</p>
										<p class="text-xs text-gray-500 truncate">
											{{ agent.description }}
										</p>
									</div>
									<button
										class="px-3 py-1 text-xs font-medium text-primary bg-primary/10 rounded-md hover:bg-primary/20 transition-colors"
									>
										{{ activeTab === 'community' ? 'Clone' : 'Use' }}
									</button>
								</div>
							</div>
						</div>
						<footer class="md:hidden flex w-full bg-[#F5F7F9] absolute bottom-0 inset-x-0 p-4 pt-6">
							<div class="options flex w-full justify-between gap-3">
								<button class="btn-outline flex-1" @click="createNewAgent">
									Agent Library
								</button>
								<button class="btn-primary flex-1" @click="createNewAgent">
									New Agent
								</button>
							</div>
						</footer>
					</DropdownMenuContent>
				</DropdownMenuPortal>
			</DropdownMenuRoot>
		</ClientOnly>
	</div>
</template>

<script setup>
import {
	ChevronDown,
	X,
	Search,
	Users,
	Compass,
	Plus,
	Eye,
	User
} from 'lucide-vue-next'
import {
	DropdownMenuContent,
	DropdownMenuPortal,
	DropdownMenuRoot,
	DropdownMenuTrigger
} from 'radix-vue'
import {
	useFetchAgents,
	useFetchUserAgents
} from '@/composables/dashboard/assistant/agents/fetch'
import { useSelectAgent } from '@/composables/dashboard/assistant/agents/select'
import { useAssistantModal } from '@/composables/core/modals'

const props = defineProps({
	selectedAgent: {
		type: Object,
		required: true
	}
})

// Reactive data
const searchQuery = ref('')
const activeTab = ref('my')
const isOpen = ref(true)

// Tabs configuration
const tabs = [
	{ id: 'my', name: 'My agents' },
	{ id: 'community', name: 'Community Agents' }
]

// Fetch agents data
const { fetchAllAgents, fetchedAllAgents } = useFetchAgents()
const { fetchUserAgents, fetchedUserAgents, user_id } = useFetchUserAgents()
const { selectAgent } = useSelectAgent()

const recentlyUsedAgents = computed(() => {
	return fetchedUserAgents.value.sort((a, b) => {
		return new Date(b.last_used).getTime() - new Date(a.last_used).getTime()
	})
})

const communityAgents = computed(() => {
	return fetchedAllAgents.value.filter(
		(agent) => agent.creator_id !== user_id.value
	)
})

const agentOnDisplay = computed(() => {
	const returnedAgent = ref([])
	if (activeTab.value === 'my') {
		returnedAgent.value = fetchedUserAgents.value
	} else if (activeTab.value === 'community') {
		returnedAgent.value = communityAgents.value
	}
	return returnedAgent.value.filter((agent) => agent.name.toLowerCase().includes(searchQuery.value.toLowerCase()))
})

// Methods
const closeDropdown = () => {
	isOpen.value = false
}

const selectAgentAndClose = async (agent) => {
	await selectAgent(agent)
	closeDropdown()
}

const discoverMoreAgents = () => {
	closeDropdown()
	useRouter().push('/agents/explore')
}

const createNewAgent = () => {
	closeDropdown()
	useAssistantModal().openCreateAgent()
}

const handleAgentClick = (agent) => {
	if (activeTab.value === 'community') {
		closeDropdown()
		useRouter().push(`/agents/explore/${agent.id}`)
	} else {
		selectAgentAndClose(agent)
	}
}

// Fetch agents on mount
onMounted(() => {
	fetchAllAgents()
	fetchUserAgents()
})
</script>

<style scoped lang="postcss">
.controls {
	@apply flex items-center justify-between border-b border-[#E9EAEB] pb-5 mb-4;
	.options {
		@apply  items-center gap-2;
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

.dropdownBtn {
	@apply flex p-2 justify-center items-center gap-1 rounded-lg border border-gray-200 bg-gray-50 shadow-sm outline-none;
}

:deep(.dropdownBtnContent) {
	@apply md:w-[580px] w-screen md:h-[500px] max-h-[80vh] max-w-[100vw] md:p-6 p-3.5 flex flex-col md:rounded-2xl
	rounded-t-2xl  border-2 border-gray-50 bg-white md:mb-2.5 -mb-[150px] ;
	box-shadow: 0px 8px 25px 0px rgba(25, 33, 61, 0.15);
	animation: 0.3s cubic-bezier(0.16, 1, 0.3, 1) both;
}

/* Entrance animations */
:deep(.dropdownBtnContent[data-state='open'][data-side='top']) {
	animation-name: slideDownIn;
}
:deep(.dropdownBtnContent[data-state='open'][data-side='bottom']) {
	animation-name: slideUpIn;
}
:deep(.dropdownBtnContent[data-state='open'][data-side='left']) {
	animation-name: slideRightIn;
}
:deep(.dropdownBtnContent[data-state='open'][data-side='right']) {
	animation-name: slideLeftIn;
}

/* Exit animations */
:deep(.dropdownBtnContent[data-state='closed'][data-side='top']) {
	animation-name: slideDownOut;
}
:deep(.dropdownBtnContent[data-state='closed'][data-side='bottom']) {
	animation-name: slideUpOut;
}
:deep(.dropdownBtnContent[data-state='closed'][data-side='left']) {
	animation-name: slideRightOut;
}
:deep(.dropdownBtnContent[data-state='closed'][data-side='right']) {
	animation-name: slideLeftOut;
}

/* Entrance keyframes */
@keyframes slideUpIn {
	from {
		@apply opacity-0 scale-95;
		transform: translateY(10px) scale(0.95);
	}
	to {
		@apply opacity-100 scale-100;
		transform: translateY(0) scale(1);
	}
}
@keyframes slideDownIn {
	from {
		@apply opacity-0 scale-95;
		transform: translateY(-10px) scale(0.95);
	}
	to {
		@apply opacity-100 scale-100;
		transform: translateY(0) scale(1);
	}
}
@keyframes slideLeftIn {
	from {
		@apply opacity-0 scale-95;
		transform: translateX(10px) scale(0.95);
	}
	to {
		@apply opacity-100 scale-100;
		transform: translateX(0) scale(1);
	}
}
@keyframes slideRightIn {
	from {
		@apply opacity-0 scale-95;
		transform: translateX(-10px) scale(0.95);
	}
	to {
		@apply opacity-100 scale-100;
		transform: translateX(0) scale(1);
	}
}

/* Exit keyframes */
@keyframes slideUpOut {
	from {
		@apply opacity-100 scale-100;
		transform: translateY(0) scale(1);
	}
	to {
		@apply opacity-0 scale-95;
		transform: translateY(10px) scale(0.95);
	}
}
@keyframes slideDownOut {
	from {
		@apply opacity-100 scale-100;
		transform: translateY(0) scale(1);
	}
	to {
		@apply opacity-0 scale-95;
		transform: translateY(-10px) scale(0.95);
	}
}
@keyframes slideLeftOut {
	from {
		@apply opacity-100 scale-100;
		transform: translateX(0) scale(1);
	}
	to {
		@apply opacity-0 scale-95;
		transform: translateX(10px) scale(0.95);
	}
}
@keyframes slideRightOut {
	from {
		@apply opacity-100 scale-100;
		transform: translateX(0) scale(1);
	}
	to {
		@apply opacity-0 scale-95;
		transform: translateX(-10px) scale(0.95);
	}
}
</style>
