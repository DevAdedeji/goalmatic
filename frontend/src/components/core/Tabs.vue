<template>
	<div class="border-b border-border mb-6 w-full">
		<div class="flex w-full">
			<button
				v-for="(tab, i) in (tabs as string[])"
				:key="tab"
				class="px-4 py-2 border-b-2 font-medium text-sm focus:outline-none"
				:class="[
					tab == selected
						? 'border-primary text-primary'
						: 'border-transparent text-text-secondary hover:text-headline hover:border-gray-300'
				]"
				@click="onClick(tab)"
			>
				<span class="flex items-center gap-2">
					<component
						:is="icons[i]"
						v-if="icons && icons[i]"
						:size="16"
						class="flex-shrink-0"
					/>
					<span class="capitalize">{{ formatTabText(tab) }}</span>
					<span
						v-if="counts && counts[i] && counts[i] > 0"
						:class="[
							'px-2 py-0.5 rounded-full text-xs font-medium',
							getBadgeClass(tab)
						]"
					>
						{{ counts[i] }}
					</span>
				</span>
			</button>
		</div>
	</div>
</template>

<script setup lang="ts">
import { transformString } from '@/composables/utils/formatter'

const formatTabText = (text: string) => {
    return text.replace(/_/g, ' ')
}

// Helper function to get the appropriate badge color class based on tab name
const getBadgeClass = (tab: string) => {
    const tabName = tab.toLowerCase()

    if (tabName.includes('active')) {
        return 'bg-emerald-100 text-emerald-800'
    } else if (tabName.includes('draft')) {
        return 'bg-gray-100 text-gray-800'
    } else if (tabName.includes('clone')) {
        return 'bg-blue-100 text-blue-800'
    } else {
        return 'bg-gray-100 text-gray-800'
    }
}

defineProps({
    tabs: {
        type: Array,
        default: () => [],
        required: true
    },
    selected: {
        type: String,
        default: '',
        required: false
    },
    // New props for icons and counts
    icons: {
        type: Array as () => (Component | undefined)[],
        default: () => [],
        required: false
    },
    counts: {
        type: Array as () => (number | undefined)[],
        default: () => [],
        required: false
    }
})

const emit = defineEmits(['changed'])

const onClick = (selected: string) => {
    emit('changed', selected)
}
</script>

<style scoped>
.active {
    @apply border-primary text-primary;
}
</style>
