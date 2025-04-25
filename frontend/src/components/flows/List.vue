<template>
	<section>
		<div v-if="(currentTab === 'active' ? activeFlows : draftFlows).length" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
			<FlowsCard
				v-for="flow in (currentTab === 'active' ? activeFlows : draftFlows)"
				:key="flow.id"
				:flow="flow"
				@edit="emit('edit', flow)"
				@delete="emit('delete', flow)"
				@toggle-status="emit('toggle-status', flow)"
			/>
		</div>
		<div v-else class="justify-center items-center flex flex-col text-center py-10 border border-dashed border-border rounded-lg">
			<component
				:is="currentTab === 'active' ? Activity : FileEdit"
				class="mx-auto mb-3 text-gray-400"
				:size="40"
			/>
			<p class="text-text-secondary mb-2">
				No {{ currentTab }} flows yet
			</p>
			<p class="text-sm text-text-secondary mb-4">
				{{ currentTab === 'active'
					? 'Activate your draft flows to start automating your workflow'
					: 'Create your first flow to get started'
				}}
			</p>
			<button
				:class="currentTab === 'active' ? 'btn-outline border border-border' : 'btn-primary'"
				class="px-4 py-2 rounded-md"
				@click="currentTab === 'active' ? emit('currentTab', 'draft') : emit('createNewFlow')"
			>
				{{ currentTab === 'active' ? 'View Draft Flows' : 'Create New Flow' }}
			</button>
		</div>
	</section>
</template>

<script setup lang="ts">
import { Activity, FileEdit } from 'lucide-vue-next'
defineProps<{
    currentTab: string;
    activeFlows: any[];
    draftFlows: any[];
}>()

const emit = defineEmits<{(e: 'edit', flow: any): void;
    (e: 'delete', flow: any): void;
    (e: 'toggle-status', flow: any): void;
    (e: 'createNewFlow'): void;
    (e: 'currentTab', tab: string): void;
}>()

</script>

<style scoped>

</style>
