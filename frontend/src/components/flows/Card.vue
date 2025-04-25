<template>
	<div class="bg-lighter rounded-lg p-4 border border-border hover:border-border-hover transition-all">
		<!-- Header with title and actions -->
		<div class="flex justify-between items-start mb-2">
			<h3 class="font-medium text-headline">
				{{ flow.name }}
			</h3>
			<div class="flex gap-1">
				<button class="icon-btn text-text-secondary hover:text-headline" @click="$emit('edit', flow)">
					<Edit2 :size="18" />
				</button>
				<button class="icon-btn text-text-secondary hover:text-red" @click="$emit('delete', flow)">
					<Trash2 :size="18" />
				</button>
			</div>
		</div>

		<!-- Description -->
		<p class="text-sm text-text-secondary mb-3 line-clamp-2">
			{{ flow.description || 'No description' }}
		</p>

		<!-- Footer with status -->
		<div class="flex justify-between items-center">
			<!-- Status badge -->
			<span
				class="px-2 py-1 text-xs rounded-full"
				:class="statusClass"
			>
				{{ flow.status === 1 ? 'Active' : flow.status === 0 ? 'Draft' : 'Cloned' }}
			</span>

			<!-- Action button or cloned info -->
			<template v-if="flow.cloned_from">
				<span class="text-xs text-text-secondary">From: {{ flow.cloned_from.name }}</span>
			</template>
			<template v-else>
				<button
					v-if="flow.status !== 'cloned'"
					class="text-xs text-text-secondary hover:text-headline"
					@click="$emit('toggle-status', flow)"
				>
					{{ flow.status === 1 ? 'Pause' : 'Activate' }}
				</button>
			</template>
		</div>
	</div>
</template>

<script setup lang="ts">
import { Edit2, Trash2 } from 'lucide-vue-next'

interface FlowStep {
    id: string;
    name: string;
    description: string;
    type: string;
    time?: string;
    duration?: number;
    isActive: boolean;
    [key: string]: any;
}

interface Flow {
    id: string;
    name: string;
    description?: string;
    status: number | string;
    type: string;
    steps: FlowStep[];
    creator_id: string;
    created_at: any;
    updated_at: any;
    isValid: boolean;
    cloned_from?: {
        id: string;
        creator_id: string;
        name: string;
    };
}

const props = defineProps<{
    flow: Flow
}>()

const statusClass = computed(() => {
    switch (props.flow.status) {
        case 1:
            return 'bg-emerald-100 text-emerald-800'
        case 0:
            return 'bg-gray-100 text-gray-800'
        case 'cloned':
            return 'bg-blue-100 text-blue-800'
        default:
            return 'bg-gray-100 text-gray-800'
    }
})

const emit = defineEmits<{(e: 'edit', flow: Flow): void
    (e: 'delete', flow: Flow): void
    (e: 'toggle-status', flow: Flow): void
}>()
</script>

<style scoped>
.icon-btn {
    @apply p-1 rounded-md hover:bg-gray-100 transition-colors;
}
</style>
