<template>
	<Modal
		modal="$atts.modal"
		title="Approve Agent Tools"
		:is-full-height="false"
		:props-modal="propsModal"
	>
		<div class="flex flex-col gap-4">
			<div v-if="toolsRequiringConfig.length > 0" class="bg-blue-50 border border-blue-200 rounded-md p-3 text-blue-800 mb-4">
				<p class="text-sm">
					<span class="font-bold">Note:</span> This agent requires the following tools to be configured or integrated before cloning.
				</p>
			</div>
			<div v-else class="bg-green-50 border border-green-200 rounded-md p-3 text-green-800 mb-4">
				<p class="text-sm">
					<span class="font-bold">Note:</span> This agent is ready to be cloned.
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

					<!-- Integration Status (for tools that require integration) -->
					<div v-if="tool.checkStatus" class="bg-amber-50 border border-amber-200 rounded-md p-3 text-amber-800 mb-3">
						<p class="text-xs">
							<span class="font-bold">Required Integration:</span>  {{ tool.name }} integration required.
						</p>
					</div>

					<!-- Configuration Requirements (for tools with config) -->
					<div v-if="tool.config && tool.config.length > 0" class="bg-amber-50 border border-amber-200 rounded-md p-3 text-amber-800 mb-3">
						<p class="text-xs">
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
							class="btn-primary"
							:disabled="cloningTable === tool.id"
							@click="cloneTable(tool)"
						>
							<Spinner v-if="cloningTable === tool.id" size="14px" />
							<span v-else>Clone Table</span>
						</button>

						<!-- Connect Integration button (for tools requiring integration) -->
						<button
							v-if="tool.checkStatus && !hasIntegration(tool)"
							class="btn-primary"
							:disabled="connectingIntegration === tool.id"
							@click="connectToolIntegration(tool)"
						>
							<Spinner v-if="connectingIntegration === tool.id" size="14px" />
							<span v-else>Connect {{ tool.name }}</span>
						</button>

						<!-- Configure button for all tools -->
						<button
							v-if="tool.config && tool.config.length > 0 && !isTableTool(tool)"
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
					:disabled="hasUnconfiguredTools || loading"
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
import { useConnectIntegration } from '@/composables/dashboard/integrations/connect'

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
const connectingIntegration = ref<string | null>(null)
const { editToolConfig } = useEditToolConfig()
const { openAlert } = useAlert()
const { connectIntegration } = useConnectIntegration()

// Get tools that require configuration from the payload
const toolsRequiringConfig = computed(() => {
	return props.payload?.toolsRequiringConfig || []
})

// Get user integrations from the payload
const userIntegrations = computed(() => {
	return props.payload?.userIntegrations || []
})

// Check if there are any tools that still need configuration or integrations
const hasUnconfiguredTools = computed(() => {
	return toolsRequiringConfig.value.length > 0
})

// Check if a tool is a table tool
const isTableTool = (tool: Record<string, any>): boolean => {
	return tool.id === 'TABLE' || tool.primary_id === 'TABLE'
}

// Check if user has the required integration for a tool
const hasIntegration = (tool: Record<string, any>): boolean => {
	return userIntegrations.value.some(
		(integration: Record<string, any>) => integration.integration_id === tool.id
	)
}

// Connect the integration directly
const connectToolIntegration = async (tool: Record<string, any>) => {
	// Set the connecting state
	connectingIntegration.value = tool.id

	try {
		// Connect the integration
		await connectIntegration(tool.id)

		// Show success message
		openAlert({
			type: 'SUCCESS',
			msg: `${tool.name} integration connection initiated`
		})

		// The integration connection happens in a popup window
		// We need to wait for the popup to complete and the integration to be registered
		// This is handled by the event listener in the integration link function

		// We'll add a message to inform the user
		openAlert({
			type: 'Alert',
			msg: 'Please complete the authentication in the popup window',
			position: 'top-right'
		})

		// After the popup is closed and integration is registered,
		// we should refresh the user integrations list
		window.addEventListener('message', async (event) => {
			if (event.origin === window.location.origin) {
				const oauthResult = JSON.parse(localStorage.getItem('oauth_result') || '{}')
				if (oauthResult && oauthResult.success) {
					// Wait a moment for the Firestore document to be created
					setTimeout(async () => {
						// Refresh the user integrations
						if (props.payload && props.payload.refreshUserIntegrations) {
							await props.payload.refreshUserIntegrations()

							// Check if the integration is now available
							if (hasIntegration(tool)) {
								// Update the toolsRequiringConfig in the payload
								props.payload.toolsRequiringConfig = toolsRequiringConfig.value.filter(
									(t: Record<string, any>) => t.id !== tool.id
								)

								// Show success message
								openAlert({
									type: 'SUCCESS',
									msg: `${tool.name} integration connected successfully`
								})
							}
						}

						// Clear the connecting state
						connectingIntegration.value = null
					}, 2000)
				} else {
					// Clear the connecting state
					connectingIntegration.value = null

					// Show error message if authentication failed
					openAlert({
						type: 'ERROR',
						msg: 'Authentication failed or was cancelled'
					})
				}
			}
		}, { once: true })
	} catch (error) {
		// Show error message
		openAlert({
			type: 'ERROR',
			msg: `Error connecting ${tool.name} integration: ${error instanceof Error ? error.message : 'Unknown error'}`
		})

		// Clear the connecting state
		connectingIntegration.value = null
	}
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
	// Check if there are any tools that still need configuration
	if (toolsRequiringConfig.value.length > 0) {
		// Check if any tools require integration but don't have it
		const missingIntegrations = toolsRequiringConfig.value.filter(
			(tool: Record<string, any>) => tool.checkStatus && !hasIntegration(tool)
		)

		if (missingIntegrations.length > 0) {
			openAlert({
				type: 'ERROR',
				msg: `Missing required integrations: ${missingIntegrations.map((t: Record<string, any>) => t.name).join(', ')}`,
				position: 'top-right'
			})
			return
		}

		// Check if any tools require configuration
		const needsConfig = toolsRequiringConfig.value.filter(
			(tool: Record<string, any>) => tool.config && tool.config.length > 0
		)

		if (needsConfig.length > 0) {
			openAlert({
				type: 'ERROR',
				msg: 'Please configure all required tools before cloning',
				position: 'top-right'
			})
			return
		}

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
