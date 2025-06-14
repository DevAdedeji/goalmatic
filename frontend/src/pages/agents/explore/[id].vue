<template>
	<!-- =====================
    Loading State Section
====================== -->
	<div v-if="loading" class="p-4 sm:p-6">
		<div class="flex flex-col gap-4 center pt-10 px-4 animate-pulse">
			<div class="h-20 bg-gray-200 rounded-lg w-full" />
			<div class="h-32 bg-gray-200 rounded-lg w-full mt-4" />
			<div class="h-48 bg-gray-200 rounded-lg w-full mt-4" />
		</div>
	</div>

	<!-- =====================
    Error State Section
  ====================== -->
	<AgentsIdErrorState v-else-if="!agentDetails || Object.keys(agentDetails).length === 0" />

	<!-- =====================
    Main Agent Details Section
  ====================== -->
	<div v-else class="flex flex-col gap-4 center pt-10 px-4 md:px-10 2xl:max-w-5xl max-w-7xl mx-auto w-full">
		<!-- ===== Header: Agent Title, Owner, Actions ===== -->

		<section id="header" class="flex md:flex-row flex-col items-center justify-between w-full">
			<div class="flex flex-col w-full items-center md:items-start">
				<img src="/bot.png" alt="agent" class="size-[64px] rounded-full">

				<h1 class="text-headline text-2xl font-bold mt-5">
					{{ agentDetails?.name || 'Unnamed Agent' }}
				</h1>
				<p class="text-[#37363D] text-[14px] mt-2">
					Created at: {{
						agentDetails?.created_at ? formatDateString(agentDetails.created_at, {
							month: 'short',
							day: 'numeric',
							year: 'numeric'
						}) : 'Unknown date'
					}}
				</p>
				<div class="flex mt-5 gap-2">
					<button v-if="isOwner(agentDetails) || agentDetails?.id === '0'" class="btn-primary gap-2 w-full md:w-auto" @click="selectAgent(agentDetails)">
						Use agent
						<MoveUpRight :size="16" />
					</button>
					<button v-if="id !== '0' && !isOwner(agentDetails)" class="btn-icon gap-2 text-primary" :disabled="cloneLoading" :title="!canCloneAgent(agentDetails) ? (agentDetails?.creator_id === user_id ? 'You cannot clone your own agent' : 'You must be logged in to clone an agent') : 'Clone this agent'"
						@click="cloneAgent(agentDetails)">
						Clone
						<Copy :size="16" color="#601DED" />
					</button>

					<IconDropdown
						v-if="isOwner(agentDetails)"
						:data="agentDetails"
						:children="[
							{
								name: agentDetails?.public ? 'Make Private' : 'Make Public',
								icon: agentDetails?.public ? EyeClosed : Eye,
								func: openVisibilityConfirmation,
								class: '!text-primary hover:!bg-primary hover:!text-white'
							},
							{
								name: 'Delete Agent',
								icon: Trash,
								func: setDeleteAgentData,
								class: '!text-danger hover:!bg-danger hover:!text-white'
							}
						]"
						btn-class="icon-btn gap-2"
						class-name="w-40"
						:index="0"
					/>
				</div>
			</div>

			<article class="flex flex-col gap-3.5 mt-8 md:mt-0 w-full">
				<h2 class="font-medium">
					Details
				</h2>
				<p class="text-subText text-[14px] text-[#7A797E]">
					By {{ agentDetails?.user?.name || 'Unknown User' }}
				</p>

				<p class="text-subText text-[14px] text-[#7A797E]">
					Last Updated: {{ agentDetails?.updated_at ? formatDateString(agentDetails.updated_at, {
						month: 'short',
						day: 'numeric',
						year: 'numeric'
					}) : 'Unknown date' }}
				</p>
			</article>
		</section>


		<!-- ===== About Section: Description ===== -->
		<section id="about" class="card md:mt-8 mt-4 gap-2">
			<div class="flex justify-between items-center">
				<h1 class="text-headline text-base font-semibold">
					About
				</h1>
				<button v-if="!isEditingDescription && isOwner(agentDetails)" class="btn-text" @click="editDescription(agentDetails)">
					Edit
				</button>
				<div v-else-if="isEditingDescription" class="flex gap-2">
					<button class="btn-text" @click="cancelEditDescription(agentDetails)">
						Cancel
					</button>
					<button class="btn-text btn !bg-primary disabled:!bg-gray-500 text-light" :disabled="updateDescriptionLoading" @click="saveDescription(id as string, updateDescription)">
						<span v-if="!updateDescriptionLoading">save</span>
						<Spinner v-else size="14px" />
					</button>
				</div>
			</div>

			<!-- Use textarea for editing description -->
			<textarea v-if="isEditingDescription && isOwner(agentDetails)" v-model="descriptionModel" class="input-textarea w-full min-h-[150px] text-sm text-subText" placeholder="Enter agent description..." />
			<!-- Display description text when not editing -->
			<div v-else class="text-sm text-subText prose max-w-none" v-html="descriptionModel || '<p>No description provided.</p>'" />
		</section>

		<!-- ===== System Information Section ===== -->
		<section id="system-info" class="card md:mt-10 mt-4 gap-2">
			<div class="flex justify-between items-center">
				<h1 class="text-headline text-base font-semibold">
					System Information
				</h1>
				<button v-if="!isEditingSystemInfo && isOwner(agentDetails)" class="btn-text" @click="editSystemInfo(agentDetails)">
					Edit
				</button>
				<div v-else-if="isEditingSystemInfo" class="flex gap-2">
					<button class="btn-text" @click="cancelSystemInfoEdit(agentDetails)">
						Cancel
					</button>
					<button class="btn-text btn !bg-primary disabled:!bg-gray-500 text-light" :disabled="updateSystemInfoLoading || !agentDetails?.spec" @click="updateSystemInfo(id as string, agentDetails?.spec || {})">
						<span v-if="!updateSystemInfoLoading">save</span>
						<Spinner v-else size="14px" />
					</button>
				</div>
			</div>

			<!-- System Info Editor (Editable or View Only) -->
			<Editor v-model="systemInfoModel" :editable="isEditingSystemInfo && isOwner(agentDetails)" :class="{
				'bg-white rounded-lg border': isEditingSystemInfo && isOwner(agentDetails),
				'view-only': !isEditingSystemInfo || !isOwner(agentDetails),
			}" />
		</section>

		<!-- ===== Tools Section: Agent Tool Library ===== -->
		<section id="tools" class="card border md:mt-10 mt-4 gap-2">
			<div class="flex justify-between items-center">
				<h1 class="text-headline text-base font-semibold">
					Agent Tool Library
				</h1>
				<button v-if="!isEditingTools && isOwner(agentDetails)" class="btn-text" @click="editTools(agentDetails)">
					Edit
				</button>
				<div v-else-if="isEditingTools" class="flex gap-2">
					<button class="btn-text" @click="cancelEdit(agentDetails)">
						Cancel
					</button>
					<button class="btn-text btn !bg-primary disabled:!bg-gray-500 text-light" :disabled="updateToolsLoading" @click="updateTools(id as string, agentDetails?.spec || {})">
						<span v-if="!updateToolsLoading">save</span>
						<Spinner v-else size="14px" />
					</button>
				</div>
			</div>

			<!-- Tools List (View Mode) -->
			<div v-if="!isEditingTools" class="text-subText md:text-[15px] text-xs">
				<div v-if="!agentDetails?.spec?.tools?.length" class="flex flex-col items-center gap-2 ">
					<PencilRuler :size="24" color="#601DED" />
					<span class="text-headline text-lg font-semibold">No tools added</span>
				</div>
				<div v-else class="grid grid-cols-1 md:grid-cols-3 gap-4">
					<div v-for="tool in agentDetails.spec.tools" :key="tool.id" class="bg-white rounded-lg p-4 border">
						<div class="flex items-center gap-2">
							<img :src="tool.icon" alt="google calendar" class="size-7">
							<div class="flex flex-col">
								<span class="text-headline text-sm font-bold">{{ tool.name }}</span>
								<span class="text-subText text-[10px]  font-semibold">{{ tool.id.split('_')[0] }}</span>
							</div>
						</div>
					</div>
				</div>
			</div>

			<!-- Tools List (Edit Mode) -->
			<div v-else class="mt-4">
				<section v-if="toolsModel.length" class="flex flex-wrap p-3 rounded-md border border-primary my-3 gap-2">
					<div v-for="tool in toolsModel" :key="tool.id" class="card2">
						<img :src="tool.icon" alt="google calendar" class="size-7">
						<div class="flex flex-col">
							<span class="text-headline text-sm font-bold">{{ tool.name }}</span>
							<span class="text-subText text-xs  font-normal">{{ tool.id.split('_')[0] }}</span>
						</div>
						<button class="gap-2 ml-4" @click="removeTool(toolsModel, tool)">
							<XCircle :size="16" color="#601DED" />
						</button>
					</div>
				</section>
				<div class="flex flex-col gap-4">
					<div class="relative">
						<input v-model="toolSearch" type="text" class="input-field w-full !pl-10" placeholder="Search for a Tool">
						<Search class="absolute left-3 top-1/2 -translate-y-1/2" :size="18" color="#8F95B2" />
					</div>

					<!-- Filtered Tools List for Selection -->
					<div class="flex flex-col gap-4">
						<div v-for="tool in filteredTools" :key="tool.id" class="bg-white rounded-lg p-4 border">
							<div class="flex gap-4 w-full">
								<img :src="tool.icon" :alt="tool.name" class="w-8 h-8">
								<div class="flex flex-col gap-2 w-full">
									<div class="flex justify-between items-center w-full">
										<h3 class="text-sm font-semibold text-headline">
											{{ tool.name }}
										</h3>
										<div class="flex items-center gap-1 text-xs">
											<button v-if="tool.config && tool.status" class="btn-text" @click="editToolConfig(tool)">
												Edit config
											</button>
											<span class="btn-status" :class="{ 'bg-[#EFE8FD] text-primary': tool.status, 'bg-line text-secondary': !tool.status }">{{ tool.status ? 'Connected' : 'Not Connected' }}</span>
											<button v-if="!tool.status" class="btn-text btn !bg-primary text-light" @click="connectIntegration(tool.id)">
												Connect
											</button>
										</div>
									</div>
									<p class="text-xs text-subText">
										{{ tool.description }}
									</p>

									<div class="flex flex-wrap gap-2 mt-1">
										<div v-if="tool.config && !isConfigSet(tool)" class="w-full mb-2">
											<p class="text-danger text-xs">
												Please set required configuration before using this tool
											</p>
										</div>
										<label v-for="ability in tool.abilities" :key="ability.name" class="flex items-center gap-2 bg-[#EFE8FD] border border-[#CFBBFA] text-[#601DED] px-2 py-1 rounded-lg text-xs" :class="{ 'opacity-50': !tool.status || (tool.config && !isConfigSet(tool)) }">
											<input v-model="toolsModel" type="checkbox" :value="ability" :disabled="!tool.status || (tool.config && !isConfigSet(tool))" class="form-checkbox h-3 w-3 text-primary rounded border-primary focus:ring-primary">
											<div class="flex items-center gap-1.5">
												<span>{{ ability.name }}</span>
											</div>
										</label>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</section>
	</div>
</template>

<!-- =====================
  Script Setup Section
====================== -->

<script setup lang="ts">
// ===== Imports =====
import { EyeClosed, MoveUpRight, Trash, Eye, PencilRuler, Search, XCircle, Copy, Edit2 } from 'lucide-vue-next'
import { ref } from 'vue'
import IconDropdown from '@/components/core/IconDropdown.vue'
import DashboardLayout from '@/layouts/Dashboard.vue'
import Editor from '@/components/core/Editor.vue'
import Popover from '@/components/core/Popover.vue'
import { useFetchAgentsById } from '@/composables/dashboard/assistant/agents/id'
import { useEditAgent } from '@/composables/dashboard/assistant/agents/edit'
import { formatDateString } from '@/composables/utils/formatter'
import { useSelectAgent } from '@/composables/dashboard/assistant/agents/select'
import { useDeleteAgent } from '@/composables/dashboard/assistant/agents/delete'
import { useConnectIntegration } from '@/composables/dashboard/integrations/connect'
import { isConfigSet } from '@/composables/dashboard/assistant/agents/tools/list'
import { useEditToolConfig } from '@/composables/dashboard/assistant/agents/tools/config'
import { useCloneAgent } from '@/composables/dashboard/assistant/agents/clone'
import { useUser } from '@/composables/auth/user'
import { useAgentOwner } from '@/composables/dashboard/assistant/agents/owner'
import AgentsIdErrorState from '@/components/agents/id/ErrorState.vue'
import Spinner from '@/components/core/Spinner.vue'
import { useCustomHead } from '@/composables/core/head'
import { useAgentDetails, isEditingSystemInfo, isEditingTools, toolsModel, toolSearch, filteredTools } from '@/composables/dashboard/assistant/agents/details'
import { useHeaderTitle } from '@/composables/core/headerTitle'

// ===== State and Composables =====
useHeaderTitle().setTitle('Agents')

const loading = ref(false)

const { connectIntegration } = useConnectIntegration()
const { cloneAgent, loading: cloneLoading, canCloneAgent } = useCloneAgent()
const { id: user_id } = useUser()
const { isOwner } = useAgentOwner()

const { setDeleteAgentData } = useDeleteAgent()
const { selectAgent } = useSelectAgent()
const { fetchAgentsById, agentDetails } = useFetchAgentsById()
// Import only the functions and loading states from edit.ts, not the state variables
const {
	updateSystemInfoLoading, updateSystemInfo,
	updateToolsLoading, updateTools,
	openVisibilityConfirmation, updateName, updateNameLoading, updateDescription, updateDescriptionLoading
} = useEditAgent()


const { editToolConfig } = useEditToolConfig()

// ===== Route and Data Fetching =====
const { id } = useRoute().params
await fetchAgentsById(id as string)

watch(() => useRoute().params.id, async (newId) => {
	await fetchAgentsById(newId as string)
	await useCustomHead({
	title: `${agentDetails.value?.name || 'Agent'} | Agent Details`,
	desc: agentDetails.value?.description || 'View agent details and capabilities',
	img: 'https://www.goalmatic.io/og2.png'
})
}, { immediate: true })


// Add null checks before using agentDetails in useCustomHead
await useCustomHead({
	title: `${agentDetails.value?.name || 'Agent'} | Agent Details`,
	desc: agentDetails.value?.description || 'View agent details and capabilities',
	img: 'https://www.goalmatic.io/og2.png'
})

// ===== Agent Details Composable Setup =====
const {
 titleInputRef, titlePopoverOpen, currentTitle, isEditingDescription, descriptionModel, setupWatchers,
	systemInfoModel, removeTool, openTitlePopover, saveTitle, editDescription, cancelEditDescription,
	saveDescription, editSystemInfo, editTools, cancelEdit, cancelSystemInfoEdit
} = useAgentDetails()

// Setup watchers for agent details
setupWatchers(agentDetails)


// ===== Page Meta =====
definePageMeta({
	layout: 'dashboard'
})

</script>

<!-- =====================
  Style Section
====================== -->

<style scoped lang="scss">
:deep(.icon-btn) {
	@apply size-10 rounded-md p-2 border border-[#E1E6EC] bg-[#F7F9FB];







}
.card {
	@apply bg-[#f6f5ffa3] rounded-lg py-4 px-3.5 w-full flex flex-col;

	h2 {
		@apply text-headline text-2xl font-semibold;
	}

	.info {
		@apply text-subText text-xs flex items-center gap-2 flex-wrap;

		.dot {
			@apply w-1 h-1 bg-primary rounded-full inline-block mx-2;
		}
	}
}

.card2 {
	@apply bg-[#EFE8FD] border border-[#CFBBFA] text-primary flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium;
}

.input-text {
	@apply border rounded-lg py-2 px-3 text-sm focus:outline-none focus:border-primary;
}

.btn-status {
	@apply border border-[#CFBBFA] px-2 py-1 rounded-lg text-xs font-medium;
}

.form-checkbox {
	@apply rounded border-primary text-primary focus:ring-primary;

	&:checked {
		background-image: url("data:image/svg+xml,%3csvg viewBox='0 0 16 16' fill='white' xmlns='http://www.w3.org/2000/svg'%3e%3cpath d='M12.207 4.793a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0l-2-2a1 1 0 011.414-1.414L6.5 9.086l4.293-4.293a1 1 0 011.414 0z'/%3e%3c/svg%3e");
		@apply bg-primary;
	}
}

:deep(.tiptap-editor) {
	.ProseMirror {
		min-height: 150px;
		@apply text-sm text-subText;

		&:focus {
			outline: none;
		}
	}
}

:deep(.view-only) {
	.ProseMirror {
		min-height: auto;
		padding: 0;

		&:hover {
			cursor: default;
		}

		p:last-child {
			margin-bottom: 0;
		}
	}
}
</style>
