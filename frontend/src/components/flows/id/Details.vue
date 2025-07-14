<template>
	<FlowsIdFlowSection v-if="currentTab === 'editor'" :flow-data="flowData" />
	<FlowsIdLogs
		v-if="currentTab === 'logs'"
		:flow-logs="flowLogs"
		:loading="flowLogsLoading"
		@refresh-logs="emit('refreshLogs')"
	/>
</template>

<script setup lang="ts">
import { defineProps, defineEmits } from 'vue'
import FlowsIdFlowSection from '@/components/flows/id/FlowSection.vue'
import FlowsIdLogs from '@/components/flows/id/Logs.vue'


// Define Props and Emits
defineProps<{
	flowData: Record<string, any>
	currentTab: string
	flowLogs: any[]
	flowLogsLoading: boolean
}>()

const emit = defineEmits<{
	refreshLogs: []
}>()


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
