<template>
	<section class="flex flex-col items-start w-full gap-6">
		<div class="flex justify-between items-start  flex-wrap gap-4 w-full">
			<div class="flex flex-col flex-1">
				<!-- Title Display & Popover -->
				<div class="flex items-center gap-2 mb-2">
					<Popover align="start" :open="titlePopoverOpen" :modal="true" @update:open="titlePopoverOpen = $event">
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
				</div>

				<!-- Description Display & Popover -->
				<div class="flex items-start gap-2">
					<Popover align="start" :open="descriptionPopoverOpen" :modal="true" @update:open="descriptionPopoverOpen = $event">
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
				</div>
			</div>
			<div class="flex gap-3 w-full md:w-auto md:min-w-[300px] flex-wrap">
				<Tooltip v-if="!allNodesValid && flowData.status !== 1" placement="top">
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
				<Tooltip v-if="!allNodesValid" placement="top">
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
			</div>
		</div>

		<ColorBadge :name="flowData.status === 1 ? 'active' : flowData.status === 0 ? 'draft' : String(flowData.status)" />
		<Tabs
			:tabs="['editor', 'runs']"
			:selected="currentTab"
			:icons="[Settings, Play]"
			:counts="[undefined, flowRuns.length]"
			class="mb-6"
			@changed="$emit('update:currentTab', $event)"
		/>
	</section>
</template>

<script setup lang="ts">
import { Edit2, Settings, Play, PlayCircle } from 'lucide-vue-next'
import { computed } from 'vue'
import { useEditFlow } from '@/composables/dashboard/flows/edit'
import { useToggleFlow } from '@/composables/dashboard/flows/toggle'
import { useTestFlow } from '@/composables/dashboard/flows/test'
import { isNodeValid } from '@/composables/dashboard/flows/nodes/nodeOperations'
import Tooltip from '@/components/core/Tooltip.vue'

const { updateFlow, saveFlow } = useEditFlow()
const { toggleFlowStatus, loading: toggleLoading } = useToggleFlow()
const { testFlow, loading: testLoading } = useTestFlow()

const props = defineProps({
	flowData: {
		type: Object,
		required: true
	},
	currentTab: {
		type: String,
		required: true
	},
    flowRuns: {
        type: Array,
        required: true
    }
})

// Check if all nodes in the flow are valid
const allNodesValid = computed(() => {
	// Check trigger node if it exists
	if (props.flowData.trigger && !isNodeValid(props.flowData.trigger)) {
		return false
	}

	// Check all action nodes
	if (props.flowData.steps && props.flowData.steps.length > 0) {
		for (const step of props.flowData.steps) {
			if (!isNodeValid(step)) {
				return false
			}
		}
	}

	return true
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

// Define emits
const emit = defineEmits(['update:currentTab'])
</script>
