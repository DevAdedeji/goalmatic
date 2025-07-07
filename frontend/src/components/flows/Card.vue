<template>
	<article class="workflow-card" @click="emit('edit', flow)">
		<div class="card-body">
			<header class="card-header">
				<div class="title-section">
					<h4 class="flow-title">
						{{ flow.name }}
					</h4>
					<span v-if="!isFlowValid" class="warning-indicator">
						⚠️
					</span>
				</div>
				<div class="action-buttons">
					<IconDropdown
						:data="flow"
						:children="dropdownItems"
						btn-class="icon-btn text-text-secondary hover:text-headline border p-1.5 rotate-90 rounded-md bg-[#F5F7F9] cursor-pointer"
						class-name="w-40"
						:index="0"
					/>
				</div>
			</header>

			<p class="flow-description">
				{{ flow.description || 'No description' }}
			</p>

			<!-- Last run info -->
			<div v-if="flow.last_run" class="last-run-info">
				<span class="last-run-text">Last run {{ formatLastRun(flow.last_run) }}</span>
			</div>
		</div>

		<footer class="card-footer">
			<div class="status-section">
				<!-- Status badge -->
				<span class="status-badge" :class="statusClass">
					<span class="status-dot" />
					{{ flow.status === 1 ? 'Active' : flow.status === 0 ? 'Draft' : 'Cloned' }}
				</span>

				<!-- Integration icons with counts -->
				<div v-if="flow.integrations && flow.integrations.length" class="integration-icons">
					<div v-for="integration in flow.integrations" :key="integration.name" class="integration-item">
						<img :src="integration.icon || '/icons/default.svg'" :alt="integration.name" class="integration-icon">
						<span v-if="integration.count" class="integration-count">+{{ integration.count }}</span>
					</div>
				</div>

				<!-- Usage count with heart -->
				<div v-if="flow.usage_count" class="usage-count">
					<Heart :size="14" class="text-red-500" />
					<span>{{ flow.usage_count }}</span>
				</div>
			</div>

			<div class="creator-section">
				<!-- Creator info -->
				<div class="creator-info">
					<span class="creator-text">By {{ isOwnFlow ? 'you' : (flow.creator_name || 'Unknown') }}</span>
					<img
						v-if="flow.creator_avatar || isOwnFlow"
						:src="flow.creator_avatar || '/bot.png'"
						:alt="isOwnFlow ? 'You' : flow.creator_name"
						class="creator-avatar"
					>
				</div>
			</div>
		</footer>
	</article>
</template>

<script setup lang="ts">
import { Edit2, Trash2, Heart } from 'lucide-vue-next'
import { computed } from 'vue'
import { useUser } from '@/composables/auth/user'
import IconDropdown from '@/components/core/IconDropdown.vue'

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
    trigger?: any;
    creator_id: string;
    creator_name?: string;
    creator_avatar?: string;
    created_at: any;
    updated_at: any;
    last_run?: any;
    isValid: boolean;
    usage_count?: number;
    integrations?: Array<{
        name: string;
        icon?: string;
        count?: number;
    }>;
    cloned_from?: {
        id: string;
        creator_id: string;
        name: string;
    };
}

const props = defineProps<{
    flow: Flow
}>()

const { id: user_id } = useUser()

const isOwnFlow = computed(() => {
    return props.flow.creator_id === user_id.value
})

const isFlowValid = computed(() => {
    // Check if flow has both trigger and at least one action step
    const hasTrigger = props.flow.trigger !== undefined && props.flow.trigger !== null
    const hasActionSteps = props.flow.steps && props.flow.steps.length > 0
    return hasTrigger && hasActionSteps
})

const statusClass = computed(() => {
    switch (props.flow.status) {
        case 1:
            return 'status-active'
        case 0:
            return 'status-draft'
        case 'cloned':
            return 'status-cloned'
        default:
            return 'status-draft'
    }
})

const formatLastRun = (lastRun: any): string => {
    if (!lastRun) return ''

    try {
        let date: Date

        // Handle Firebase Timestamp
        if (lastRun && typeof lastRun === 'object' && 'toDate' in lastRun) {
            date = lastRun.toDate()
        } else {
            date = new Date(lastRun)
        }

        if (isNaN(date.getTime())) return ''

        const now = new Date()
        const diffMs = now.getTime() - date.getTime()
        const diffMins = Math.floor(diffMs / (1000 * 60))
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

        if (diffMins < 1) return 'just now'
        if (diffMins < 60) return `${diffMins}m ago`
        if (diffHours < 24) return `${diffHours}h ago`
        if (diffDays < 7) return `${diffDays}d ago`

        return date.toLocaleDateString()
    } catch (error) {
        return ''
    }
}

const dropdownItems = computed(() => [
    {
        name: 'Edit',
        icon: Edit2,
        func: (flow: Flow) => emit('edit', flow)
    },
    {
        name: 'Delete',
        icon: Trash2,
        func: (flow: Flow) => emit('delete', flow),
        class: 'text-red-600 hover:text-red-700'
    }
])

const emit = defineEmits<{(e: 'edit', flow: Flow): void
    (e: 'delete', flow: Flow): void
}>()
</script>

<style scoped lang="postcss">
.workflow-card {
    @apply bg-[#F5F7F9] flex flex-col border border-[#DCE3EA] rounded-xl overflow-hidden hover:border-[#C7CDD5] transition-all duration-200;
}

.card-body {
    @apply bg-white border-b border-[#EFE8FD] p-4 rounded-xl;
}

.card-header {
    @apply flex justify-between items-start mb-3;
}

.title-section {
    @apply flex items-start gap-2 flex-1;
}

.flow-title {
    @apply text-[#1F1F1F] text-sm font-semibold leading-[140%] tracking-[-0.56px] line-clamp-2;
}

.warning-indicator {
    @apply text-xs flex-shrink-0 mt-0.5;
}

.action-buttons {
    @apply flex gap-1 flex-shrink-0;
}

.icon-btn {
    @apply p-1.5 rounded-md hover:bg-gray-100 transition-colors;
}

.flow-description {
    @apply text-[#7A797E] text-xs font-medium leading-[14.4px] line-clamp-2 mb-3;
}

.last-run-info {
    @apply mt-2;
}

.last-run-text {
    @apply text-[#7A797E] text-xs font-medium;
}

.card-footer {
    @apply p-4 flex justify-between items-center bg-[#F5F7F9];
}

.status-section {
    @apply flex items-center gap-3;
}

.status-badge {
    @apply flex items-center gap-1.5 px-2 py-1 text-xs font-semibold rounded-full;
}

.status-dot {
    @apply w-2 h-2 rounded-full;
}

.status-active {
    @apply text-emerald-800;

    .status-dot {
        @apply bg-emerald-500;
    }
}

.status-draft {
    @apply text-gray-700;

    .status-dot {
        @apply bg-gray-400;
    }
}

.status-cloned {
    @apply text-blue-700;

    .status-dot {
        @apply bg-blue-500;
    }
}

.integration-icons {
    @apply flex items-center gap-1;
}

.integration-item {
    @apply flex items-center gap-1;
}

.integration-icon {
    @apply w-4 h-4 rounded;
}

.integration-count {
    @apply text-xs font-medium text-[#7A797E];
}

.usage-count {
    @apply flex items-center gap-1 text-xs font-medium text-[#7A797E];
}

.creator-section {
    @apply flex items-center;
}

.creator-info {
    @apply flex items-center gap-2;
}

.creator-text {
    @apply text-xs font-semibold text-[#7A797E];
}

.creator-avatar {
    @apply w-[24px] h-[24px] rounded-full border border-white flex-shrink-0;
}
</style>
