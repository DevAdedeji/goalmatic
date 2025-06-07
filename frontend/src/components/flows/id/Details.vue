<template>
	<FlowsIdFlowSection v-if="currentTab === 'editor'" :flow-data="flowData" />
	<FlowsIdRunSection
		v-if="currentTab === 'runs'"
		:flow-runs="flowRuns"
		:loading="flowRunsLoading"
		@refresh-runs="$emit('refreshRuns')"
	/>
</template>

<script setup lang="ts">
import { defineProps, defineEmits } from 'vue'
import FlowsIdFlowSection from '@/components/flows/id/FlowSection.vue'
import FlowsIdRunSection from '@/components/flows/id/RunSection.vue'



// Define emits
const emit = defineEmits(['refreshRuns'])

// Define Props
defineProps({
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
		default: () => []
	},
	flowRunsLoading: {
		type: Boolean,
		default: false
	}
})


</script>

<style scoped>
/* Add any styles specific to this component if needed */
.icon-btn {
	@apply p-1 rounded-md hover:bg-gray-100 transition-colors;
}

.btn-outline {
	@apply text-headline bg-transparent hover:text-primary transition-colors;
}
</style>
