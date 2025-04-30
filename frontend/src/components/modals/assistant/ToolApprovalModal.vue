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

					<div class="flex flex-col gap-2">
						<!-- Clone Table button (only for TABLE tools) -->
						<button
							v-if="isTableTool(tool)"
							class="btn-secondary text-sm w-full flex items-center justify-center gap-2"
							:disabled="cloningTable === tool.id"
							@click="cloneTable(tool)"
						>
							<Spinner v-if="cloningTable === tool.id" size="14px" />
							<span v-else>Clone Table</span>
						</button>

						<!-- Configure button for all tools -->
						<button
							class="btn-primary text-sm w-full"
							@click="configureToolAndClose(tool)"
						>
							Configure {{ tool.name }}
						</button>
					</div>
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
import { useEditToolConfig, agentToolConfigs } from '@/composables/dashboard/assistant/agents/tools/config'
import { useAlert } from '@/composables/core/notification'
import { callFirebaseFunction } from '@/firebase/functions'

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
const cloningTable = ref<string | null>(null)
const { editToolConfig } = useEditToolConfig()
const { openAlert } = useAlert()

// Get tools that require configuration from the payload
const toolsRequiringConfig = computed(() => {
	return props.payload?.toolsRequiringConfig || []
})

// Check if a tool is a table tool
const isTableTool = (tool: Record<string, any>): boolean => {
	return tool.id === 'TABLE' || tool.primary_id === 'TABLE'
}

// Clone a table from the original agent
const cloneTable = async (tool: Record<string, any>) => {
	if (!props.payload?.agent?.id) {
		openAlert({
			type: 'ERROR',
			msg: 'Agent ID not found'
		})
		return
	}

	// Get the agent ID
	const agentId = props.payload.agent.id

	// Set loading state
	cloningTable.value = tool.id

	try {
		// Call the cloud function to clone the table, passing the agent ID instead of table ID
		const result = await callFirebaseFunction('cloneTable', { agentId }) as any

		// Get the new table ID from the result
		const newTableId = result?.tableId

		if (!newTableId) {
			throw new Error('Failed to clone table: No table ID returned')
		}

		// Update the tool configuration with the new table ID
		const toolId = tool.primary_id || tool.id
		if (agentToolConfigs.value[toolId]) {
			agentToolConfigs.value[toolId].selected_table_id = newTableId

			// Show success message
			openAlert({
				type: 'SUCCESS',
				msg: 'Table cloned successfully'
			})

			// Refresh the tools requiring configuration list
			// This will remove the tool from the list if it was the only blocking requirement
			const updatedToolsRequiringConfig = toolsRequiringConfig.value.filter((t: Record<string, any>) => {
				// If this is the tool we just configured, check if it's still required
				if (t.id === tool.id || t.primary_id === tool.primary_id) {
					// The tool is now configured, so it should be removed from the list
					return false
				}
				return true
			})

			// Update the toolsRequiringConfig in the payload
			if (props.payload) {
				props.payload.toolsRequiringConfig = updatedToolsRequiringConfig
			}

			// If there are no more tools requiring configuration, enable the Clone Agent button
			// if (updatedToolsRequiringConfig.length === 0) {
			// 	// Automatically proceed with cloning if no more tools require configuration
			// 	confirmClone()
			// }
		}
	} catch (error) {
		console.error('Error cloning table:', error)
		openAlert({
			type: 'ERROR',
			msg: `Error cloning table: ${error instanceof Error ? error.message : 'Unknown error'}`
		})
	} finally {
		cloningTable.value = null
	}
}

// Configure a specific tool
const configureToolAndClose = (tool: Record<string, any>) => {
	// // Close this modal first
	// useAssistantModal().closeToolApprovalModal()

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
