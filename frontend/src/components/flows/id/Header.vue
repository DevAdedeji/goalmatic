<template>
	<section class="flex flex-col items-start w-full gap-6">
		<div class="flex justify-between items-start  flex-wrap gap-4 w-full">
			<div class="flex flex-col flex-1">
				<!-- Title Display & Popover -->
				<div class="flex items-center gap-2 mb-2">
					<Popover v-if="isOwner(flowData)" align="start" :open="titlePopoverOpen" :modal="true" @update:open="titlePopoverOpen = $event">
						<template #trigger>
							<div class="flex items-center gap-2 cursor-pointer" @click="openTitlePopover">
								<span class="text-3xl font-medium text-headline p-1 min-w-[150px] max-w-xl break-words ">
									{{ flowData.name || 'Untitled Flow' }}
								</span>
								<Edit2 :size="16" class="hover:text-primary" />
							</div>
						</template>
						<template #content>
							<div class="min-w-[300px] p-1">
								<input
									ref="titleElement"
									v-model="currentTitle"
									type="text"
									placeholder="Flow Title"
									class="input w-full mb-2"
									@keydown.enter.prevent="saveTitle"
								>
								<div class="flex justify-end gap-2">
									<button class="btn-outline flex-1" @click="titlePopoverOpen = false">
										Cancel
									</button>
									<button class="btn-primary flex-1" @click="saveTitle">
										Save
									</button>
								</div>
							</div>
						</template>
					</Popover>
					<!-- Non-editable title for non-owners -->
					<div v-else class="flex items-center gap-2">
						<span class="text-3xl font-medium text-headline p-1 min-w-[150px] max-w-xl break-words ">
							{{ flowData.name || 'Untitled Flow' }}
						</span>
					</div>
				</div>

				<!-- Description Display & Popover -->
				<div class="flex items-start gap-2">
					<Popover v-if="isOwner(flowData)" align="start" :open="descriptionPopoverOpen" :modal="true" @update:open="descriptionPopoverOpen = $event">
						<template #trigger>
							<div class="flex items-center gap-2 cursor-pointer" @click="openDescriptionPopover">
								<span class="text-text-secondary p-1 w-full max-w-2xl break-words whitespace-pre-wrap ">
									{{ flowData.description || 'Add a description...' }}
								</span>
								<Edit2 :size="16" class="hover:text-primary" />
							</div>
						</template>
						<template #content>
							<div class="min-w-[350px] max-w-xl p-1">
								<textarea
									ref="descriptionElement"
									v-model="currentDescription"
									placeholder="Add a description..."
									class="input-textarea"
									rows="4"
									@keydown.enter.prevent="saveDescription"
								/>
								<div class="flex justify-end gap-2">
									<button class="btn-outline flex-1" @click="descriptionPopoverOpen = false">
										Cancel
									</button>
									<button class="btn-primary flex-1" @click="saveDescription">
										Save
									</button>
								</div>
							</div>
						</template>
					</Popover>
					<!-- Non-editable description for non-owners -->
					<div v-else class="flex items-center gap-2">
						<span class="text-text-secondary p-1 w-full max-w-2xl break-words whitespace-pre-wrap ">
							{{ flowData.description || 'No description provided.' }}
						</span>
					</div>
				</div>

				<!-- Creator and visibility info -->
				<div class="info">
					{{ flowData.user?.name || 'Unknown User' }} <span class="dot" />
					{{
						flowData.created_at ? formatDateString(flowData.created_at, {
							month: 'short',
							day: 'numeric',
							year: 'numeric'
						}) : 'Unknown date'
					}}

					<span class="dot" />


					<div class="flex w-[85px] items-center gap-1.5 bg-[#EFE8FD] border border-[#CFBBFA] text-[#601DED] px-2 py-1 rounded-lg text-sm font-semibold" :class="{ 'cursor-pointer hover:bg-[#E5DBFA] transition-colors': isOwner(flowData) }"
						:title="isOwner(flowData) ? 'Click to change visibility' : ''" @click="isOwner(flowData) && openVisibilityConfirmation(flowData)">
						<span>{{ flowData?.public ? 'Public' : 'Private' }}</span>
						<EyeClosed v-if="!flowData?.public" :size="16" />
						<Eye v-else :size="16" />
					</div>
				</div>
			</div>
			<div class="flex gap-3 w-full md:w-auto md:min-w-[300px] flex-wrap">
				<!-- Clone Button -->
				<button
					class="btn-outline flex-1"
					:disabled="cloneLoading"
					@click="handleCloneFlow(flowData)"
				>
					<span v-if="!cloneLoading" class="flex items-center">
						<Copy :size="16" class="mr-1" />
						Clone Flow
					</span>
					<span v-else>
						<Spinner size="16" class="animate-spin" />
					</span>
				</button>

				<!-- Owner-only buttons -->
				<template v-if="isOwner(flowData)">
					<Tooltip v-if="!canActivateFlow && flowData.status !== 1" placement="top">
						<template #trigger>
							<button
								class="btn-outline flex-1 cursor-not-allowed opacity-60"
								disabled
							>
								Activate Flow
							</button>
						</template>
						<template #content>
							<div class="p-2 max-w-xs">
								<p>Cannot activate flow with invalid nodes. Please configure all required properties first.</p>
							</div>
						</template>
					</Tooltip>
					<button
						v-else
						class="btn-outline flex-1"
						:disabled="toggleLoading"
						@click="toggleFlowStatus(flowData)"
					>
						<span v-if="!toggleLoading">
							{{ flowData.status === 1 ? 'Pause Flow' : 'Activate Flow' }}
						</span>
						<span v-else>
							<Spinner size="16" class="animate-spin" />
						</span>
					</button>
					<button class="btn-primary flex-1" @click="saveFlow">
						Save Flow
					</button>

					<!-- Test Flow Button -->
					<Tooltip v-if="!canRunTests" placement="top">
						<template #trigger>
							<button
								class="btn-outline w-full  cursor-not-allowed opacity-60"
								disabled
							>
								<PlayCircle :size="16" class="mr-1" />
								Test Flow
							</button>
						</template>
						<template #content>
							<div class="p-2 max-w-xs">
								<p>Cannot test flow with invalid nodes. Please configure all required properties first.</p>
							</div>
						</template>
					</Tooltip>
					<button
						v-else
						class="btn-outline w-full mt-2 flex items-center justify-center"
						:disabled="testLoading"
						@click="handleTestFlow"
					>
						<span v-if="!testLoading" class="flex items-center">
							<PlayCircle :size="16" class="mr-1" />
							Test Flow
						</span>
						<span v-else>
							<Spinner size="16" class="animate-spin" />
						</span>
					</button>
				</template>
			</div>
		</div>

		<ColorBadge :name="flowData.status === 1 ? 'active' : flowData.status === 0 ? 'draft' : String(flowData.status)" />
		<Tabs
			:tabs="['editor', 'runs']"
			:selected="currentTab"
			:icons="[Settings, Play]"
			:counts="[undefined, flowLogs.length]"
			class="mb-6"
			@changed="$emit('update:currentTab', $event)"
		/>
	</section>
</template>

<script setup lang="ts">
import { Edit2, Settings, Play, PlayCircle, Copy, EyeClosed, Eye } from 'lucide-vue-next'
import { computed } from 'vue'
import { useEditFlow } from '@/composables/dashboard/flows/edit'
import { useToggleFlow } from '@/composables/dashboard/flows/toggle'
import { useTestFlow } from '@/composables/dashboard/flows/test'
import { useCloneFlow } from '@/composables/dashboard/flows/clone'
import { useFlowOwner } from '@/composables/dashboard/flows/owner'
import { useUser } from '@/composables/auth/user'
import { isNodeValid } from '@/composables/dashboard/flows/nodes/nodeOperations'
import { formatDateString } from '@/composables/utils/formatter'
import Tooltip from '@/components/core/Tooltip.vue'
import { useAlert } from '@/composables/core/notification'

const { updateFlow, saveFlow, openVisibilityConfirmation } = useEditFlow()
const { toggleFlowStatus, loading: toggleLoading } = useToggleFlow()
const { testFlow, loading: testLoading } = useTestFlow()
const { cloneFlow, loading: cloneLoading } = useCloneFlow()
const { isOwner } = useFlowOwner()
const { id: user_id, isLoggedIn } = useUser()
const { openAlert } = useAlert()

const props = defineProps({
	flowData: {
		type: Object,
		required: true
	},
	currentTab: {
		type: String,
		required: true
	},
    flowLogs: {
        type: Array,
        default: () => []
    }
})

// Check if the flow can be activated
const canActivateFlow = computed(() => {
	// Must have a trigger
	if (!props.flowData.trigger) {
		return false
	}

	// Must have at least one action step
	if (!props.flowData.steps || props.flowData.steps.length === 0) {
		return false
	}

	// Check if trigger is valid
	if (!isNodeValid(props.flowData.trigger)) {
		return false
	}

	// Check if all action nodes are valid
	for (const step of props.flowData.steps) {
		if (!isNodeValid(step)) {
			return false
		}
	}

	return true
})

// Check if the flow can be tested (needs at least one valid node)
const canRunTests = computed(() => {
	// Check if trigger exists and is valid
	if (props.flowData.trigger && isNodeValid(props.flowData.trigger)) {
		return true
	}

	// Check if at least one action step exists and is valid
	if (props.flowData.steps && props.flowData.steps.length > 0) {
		for (const step of props.flowData.steps) {
			if (isNodeValid(step)) {
				return true
			}
		}
	}

	return false
})

// Refs for input elements inside popovers
const titleElement = ref<HTMLInputElement | null>(null)
const descriptionElement = ref<HTMLTextAreaElement | null>(null)
const titlePopoverOpen = ref(false)
const descriptionPopoverOpen = ref(false)

// Local state for input values within popovers
const currentTitle = ref('')
const currentDescription = ref('')

const openTitlePopover = () => {
    titlePopoverOpen.value = true
    currentTitle.value = props.flowData.name || ''
}

const openDescriptionPopover = () => {
	descriptionPopoverOpen.value = true
	currentDescription.value = props.flowData.description || ''
}

const saveTitle = () => {
    updateFlow({
        ...props.flowData,
		name: currentTitle.value
    })
    titlePopoverOpen.value = false
}

const saveDescription = () => {
    updateFlow({
        ...props.flowData,
        description: currentDescription.value
    })
    descriptionPopoverOpen.value = false
}

// Handle test flow button click
const handleTestFlow = () => {
    testFlow(props.flowData, () => {
        // Switch to the runs tab after successful test
        emit('update:currentTab', 'runs')
    })
}

// Handle clone flow button click
const handleCloneFlow = (flow: Record<string, any>) => {
    // Check if user can clone this flow and show appropriate error messages
    if (!isLoggedIn.value) {
        openAlert({
            type: 'ERROR',
            msg: 'You must be logged in to clone a workflow',
            position: 'bottom-right'
        })
        return
    }

    if (flow.creator_id === user_id.value) {
        openAlert({
            type: 'ERROR',
            msg: 'You cannot clone your own workflow'
        })
        return
    }

    // If all checks pass, proceed with cloning
    cloneFlow(flow)
}

// Define emits
const emit = defineEmits(['update:currentTab'])
</script>

<style scoped lang="scss">
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
</style>
