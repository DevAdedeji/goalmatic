<template>
	<Modal
		modal="$atts.modal"
		title="Approve Agent Tools"
		:is-full-height="false"
		:props-modal="propsModal"
	>
		<div class="flex flex-col gap-4">
			<p class="text-subText">
				This agent uses tools that require configuration. Please review and approve the following tools before cloning:
			</p>

			<div class="bg-blue-50 border border-blue-200 rounded-md p-3 text-blue-800 mb-4">
				<p class="text-sm">
					<span class="font-bold">Note:</span> The agent will not function properly without these tools configured.
				</p>
			</div>

			<!-- Tools List -->
			<div class="space-y-4">
				<div v-for="tool in toolsRequiringConfig" :key="tool.id" class="border rounded-md p-4">
					<div class="flex items-center gap-2 mb-3">
						<img :src="tool.icon" alt="tool icon" class="size-7">
						<div class="flex flex-col">
							<span class="text-headline text-sm font-bold">{{ tool.name }}</span>
							<span class="text-subText text-[10px] font-semibold">{{ tool.id }}</span>
						</div>
					</div>

					<div class="bg-amber-50 border border-amber-200 rounded-md p-3 text-amber-800 mb-3">
						<p class="text-sm">
							<span class="font-bold">Required Configuration:</span>
							<span v-for="(field, index) in tool.config" :key="field.key" class="ml-1">
								{{ field.name }}{{ index < tool.config.length - 1 ? ', ' : '' }}
							</span>
						</p>
					</div>

					<button
						class="btn-primary text-sm w-full"
						@click="configureToolAndClose(tool)"
					>
						Configure {{ tool.name }}
					</button>
				</div>
			</div>

			<div class="flex gap-3 mt-4">
				<button class="btn-outline flex-1" @click="cancelClone">
					Cancel
				</button>
				<button
					class="btn-primary flex-1"
					:disabled="toolsRequiringConfig.length > 0 || loading"
					@click="confirmClone"
				>
					<span v-if="!loading">Clone Agent</span>
					<Spinner v-else />
				</button>
			</div>
		</div>
	</Modal>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import Modal from '@/components/core/modal/Modal.vue'
import Spinner from '@/components/core/Spinner.vue'
import { useAssistantModal } from '@/composables/core/modals'
import { useEditToolConfig } from '@/composables/dashboard/assistant/agents/tools/config'

const props = defineProps({
	payload: {
		type: Object,
		required: true
	},
	propsModal: {
		type: String,
		required: false
	}
})

const loading = ref(false)
const { editToolConfig } = useEditToolConfig()

// Get tools that require configuration from the payload
const toolsRequiringConfig = computed(() => {
	return props.payload?.toolsRequiringConfig || []
})

// Configure a specific tool
const configureToolAndClose = (tool: Record<string, any>) => {
	// Close this modal first
	useAssistantModal().closeToolApprovalModal()

	// Open the tool config modal
	editToolConfig(tool)
}

// Cancel the clone operation
const cancelClone = () => {
	useAssistantModal().closeToolApprovalModal()
}

// Proceed with cloning if all tools are configured
const confirmClone = async () => {
	if (toolsRequiringConfig.value.length > 0) {
		return // Don't allow cloning if tools still need configuration
	}

	loading.value = true
	try {
		await props.payload.onConfirm()
		useAssistantModal().closeToolApprovalModal()
	} finally {
		loading.value = false
	}
}
</script>
