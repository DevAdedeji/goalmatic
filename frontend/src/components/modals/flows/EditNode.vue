<template>
	<Modal
		modal="$atts.modal"
		:title="`Edit ${payload?.name || 'Node'}`"
		:props-modal="propsModal"
		type="sidebar"
	>
		<section class="mt-6">
			<!-- Node Info Header -->
			<div class="flex items-center gap-3 mb-4">
				<img v-if="payload?.icon" :src="payload.icon" :alt="payload?.name" class="w-8 h-8">
				<div>
					<h3 class="font-medium text-headline">
						{{ payload?.name }}
					</h3>
					<p class="text-sm text-text-secondary">
						{{ payload?.description }}
					</p>
				</div>
			</div>

			<div class="border-t border-border my-4" />

			<!-- Dynamic component for node configuration -->
			<component
				:is="nodeConfigComponent"
				:payload="payload"
				:node-props="nodeProps"
				:form-values="formValues"
				:has-props="hasProps"
				:loading="loading"
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
	generic: GenericConfig
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

	// Otherwise fall back to the generic component
	return configComponents.generic
})

// Use the standard editing logic
const {
	loading,
	formValues,
	nodeProps,
	hasProps,
	saveChanges,
	closeModal
} = useEditNodeLogic(props)
</script>

<style scoped>
/* Add your styles here */
</style>
