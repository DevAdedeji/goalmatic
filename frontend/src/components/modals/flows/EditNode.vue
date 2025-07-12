<template>
	<Modal
		modal="$atts.modal"
		:title="`Edit ${payload?.name || 'Node'}`"
		:props-modal="propsModal"
		type="sidebar"
		:image="payload?.icon"
		:image-alt="payload?.name"
		:description="payload?.description"
	>
		<section class="mt-6">
			<component
				:is="nodeConfigComponent"
				:payload="payload"
				:node-props="nodeProps"
				:form-values="formValues"
				:has-props="hasProps"
				:loading="loading"
				:previous-node-outputs="previousNodeOutputs"
				@save="saveChanges"
				@cancel="closeModal"
			/>
		</section>
	</Modal>
</template>

<script setup lang="ts">
import { computed, defineAsyncComponent } from 'vue'
import GenericConfig from './nodeConfig/Generic.vue'
import { useEditNodeLogic } from '@/composables/dashboard/flows/nodes/nodeOperations'

// Default to GenericConfig
const configComponents = {
	generic: GenericConfig,
	SEND_WHATSAPP_MESSAGE: defineAsyncComponent(() => import('./nodeConfig/WhatsAppMessage.vue')),
	SCHEDULE_INTERVAL: defineAsyncComponent(() => import('./nodeConfig/ScheduleInterval.vue'))
	// Add node-specific components here as needed
	// For example:
	// 'GOOGLECALENDAR_CREATE_EVENT': defineAsyncComponent(() => import('./nodeConfig/GoogleCalendarCreateEvent.vue')),
	// 'SCHEDULE_TIME': defineAsyncComponent(() => import('./nodeConfig/ScheduleTime.vue')),
}

const props = defineProps({
	payload: {
		type: Object,
		default: null,
		required: false
	},
	propsModal: {
		type: String,
		required: false
	}
})

// Get the appropriate component for this node type
const nodeConfigComponent = computed(() => {
	// If we have a special component for this node type, use it
	if (props.payload?.node_id && configComponents[props.payload.node_id]) {
		return configComponents[props.payload.node_id]
	}

	return configComponents.generic
})

// Use the standard editing logic
const {
	loading,
	formValues,
	nodeProps,
	hasProps,
	saveChanges,
	closeModal,
	previousNodeOutputs
} = useEditNodeLogic(props)
</script>

<style scoped>
/* AI mode styling for input fields */
:deep(.ai-mode-input) {
	background-color: rgb(250 245 255); /* bg-purple-50 */
	border-color: var(--primary);
}

:deep(.ai-mode-input:focus) {
	border-color: var(--primary);
	box-shadow: 0 0 0 1px var(--primary);
}
:deep(.ai_selector) {
	@apply text-xs border border-gray-300 rounded px-2 py-1 focus:ring-1 focus:ring-primary outline-none w-auto min-w-20
}
</style>
