<template>
	<div class="px-4 py-5  rounded-b-xl relative w-full  border-[1.5px] bg-light"
		:class="{ 'cursor-pointer': isOwner, 'cursor-default': !isOwner }"
		@click="isOwner && emit('editStep', props.step)">
		<!-- Step Header -->
		<div class="flex justify-between items-center mb-2">
			<h3 class="font-medium flex items-center gap-2">
				<img :src="step.icon" :alt="step.name" class="size-9 p-0.5 rounded-md">
				<span class="flex flex-col items-start text-xs md:text-sm">
					<span v-if="step.parent_node_id">
						<span class="text-primary font-bold">{{ step.name.split(':')[0].trim() }}</span>
					</span>
					<span class="italic">{{ step.name.split(':').pop().trim() }}</span>
				</span>
				<!-- Node Validation Status -->
				<span v-if="!isNodeValidComputed && isOwner" class="text-danger text-sm flex items-center ml-2">
					<AlertCircle :size="14" class="mr-1" />
					Invalid
				</span>
			</h3>
			<div v-if="isOwner">
				<IconDropdown
					class=""
					:data="step"
					:children="dropdownItems"
					btn-class="bg-grey p-2 rounded-md border border-line"
					class-name="w-48"
					:index="0"
					align="end"
				/>
			</div>
		</div>

		<!-- Step Description -->
		<!-- <p class="text-text-secondary">
			{{ step.description }}
		</p> -->

		<!-- Required Props Warning -->
		<div v-if="!isNodeValidComputed && isOwner" class="mt-3 p-2 bg-danger-50  rounded-md text-sm">
			<p class="font-semibold">
				This node is missing required properties:
			</p>
			<ul class="list-disc ml-5 mt-1">
				<li v-for="prop in missingRequiredProps" :key="prop.name">
					{{ prop.name }}
				</li>
			</ul>
			<p class="mt-1">
				Click the edit button to configure.
			</p>
		</div>

		<!-- Props Data Display -->
		<div v-if="hasPropsData" class="mt-3 pt-3 border-t border-gray-200">
			<p class="text-sm font-medium text-gray-600 mb-2">
				Properties:
			</p>
			<div class="grid grid-cols-1 gap-2">
				<div v-for="(value, key) in step.propsData" :key="key" class="flex gap-2 text-sm items-center">
					<span class="font-medium text-gray-700">{{ key }}:</span>
					<span class="text-gray-600 truncate flex-1">{{ formatPropertyValue(String(key), value) }}</span>
					<!-- AI Mode Indicator -->
					<span v-if="isAiEnabledField(String(key))" class="inline-flex items-center gap-1 px-2 py-1 bg-purple-100 text-primary text-xs rounded-full">
						<svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
							<path fill-rule="evenodd" d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z" clip-rule="evenodd" />
						</svg>
						AI Prompt
					</span>
				</div>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import { Edit2, Trash2, RefreshCw, AlertCircle, ChevronUp, ChevronDown } from 'lucide-vue-next'
import { computed } from 'vue'
import { isNodeValid, getMissingRequiredProps } from '@/composables/dashboard/flows/nodes/nodeOperations'
import IconDropdown from '@/components/core/IconDropdown.vue'
import { useFetchUserTables } from '@/composables/dashboard/tables/fetch'

// Define Props
const props = defineProps({
	step: {
		type: Object,
		required: true
	},
	stepIndex: {
		type: Number,
		required: true
	},
	isTrigger: {
		type: Boolean,
		default: false
	},
	isFlowActive: {
		type: Boolean,
		default: false
	},
	isOwner: {
		type: Boolean,
		default: false
	},
	totalSteps: {
		type: Number,
		default: 0
	},
	currentStepIndex: {
		type: Number,
		default: 0
	}
})

// Define Emits
const emit = defineEmits([
	'editStep',
	'removeStep',
	'changeNode',
	'moveStepUp',
	'moveStepDown'
])

// Check if node is valid - now using centralized function
const isNodeValidComputed = computed(() => {
	return isNodeValid(props.step)
})

// Access isOwner prop
const isOwner = computed(() => props.isOwner)

// Define dropdown items with conditional logic
const dropdownItems = computed(() => {
	const items = []

	// Add move up/down buttons only for non-trigger action nodes
	if (!props.isTrigger && props.isOwner) {
		// Move Up button (disabled if first step or flow is active)
		items.push({
			name: 'Move Up',
			icon: ChevronUp,
			func: (props.isFlowActive || props.currentStepIndex === 0) ? () => {} : () => emit('moveStepUp', props.currentStepIndex),
			class: (props.isFlowActive || props.currentStepIndex === 0) ? 'opacity-50 cursor-not-allowed' : 'hover:text-green-500',
			hide: false
		})

		// Move Down button (disabled if last step or flow is active)
		items.push({
			name: 'Move Down',
			icon: ChevronDown,
			func: (props.isFlowActive || props.currentStepIndex >= props.totalSteps - 1) ? () => {} : () => emit('moveStepDown', props.currentStepIndex),
			class: (props.isFlowActive || props.currentStepIndex >= props.totalSteps - 1) ? 'opacity-50 cursor-not-allowed' : 'hover:text-green-500',
			hide: false
		})
	}

	// Add standard items
	items.push(
		{
			name: 'Change Node',
			icon: RefreshCw,
			func: props.isFlowActive ? () => {} : () => emit('changeNode', props.step),
			class: props.isFlowActive ? 'opacity-50 cursor-not-allowed' : 'hover:text-blue-500',
			hide: false
		},
		{
			name: 'Edit Properties',
			icon: Edit2,
			func: props.isFlowActive ? () => {} : () => emit('editStep', props.step),
			class: props.isFlowActive ? 'opacity-50 cursor-not-allowed' : 'hover:text-primary',
			hide: false
		},
		{
			name: 'Remove Node',
			icon: Trash2,
			func: props.isFlowActive ? () => {} : () => emit('removeStep'),
			class: props.isFlowActive ? 'opacity-50 cursor-not-allowed' : 'hover:text-danger',
			hide: false
		}
	)

	// Add tooltip text when flow is active
	if (props.isFlowActive) {
		items.forEach((item) => {
			const originalFunc = item.func
			item.func = () => {
				// Do nothing when flow is active, could show a toast message here
				console.log('Cannot perform action while flow is active')
			}
		})
	}

	return items
})

// Utility: Parse mentions in Tiptap HTML to @NodeName.key
const parseMentionsFromHtml = (html: string): string => {
	if (!html) return ''
	if (typeof html !== 'string') return ''
	// Replace <span class="mention" data-id="NodeName.key">...</span> with @NodeName.key
	return html.replace(/<span[^>]*class=["']mention["'][^>]*data-id=["']([\w\-. ]+)["'][^>]*>[^<]*<\/span>/g, (match, id) => `@${id}`)
		.replace(/<[^>]+>/g, '') // Remove other HTML tags
		.replace(/&nbsp;/g, ' ')
}

// Get missing required props - now using centralized function
const missingRequiredProps = computed(() => {
	return getMissingRequiredProps(props.step)
})

// Check if node has any props data to display
const hasPropsData = computed(() => {
	return props.step.propsData && Object.keys(props.step.propsData).length > 0
})

// Check if a field is AI-enabled
const isAiEnabledField = (fieldKey: string) => {
	return props.step.aiEnabledFields && props.step.aiEnabledFields.includes(fieldKey)
}

// Get user tables for resolving table names
const { userTables } = useFetchUserTables()

// Function to resolve table ID to table name
const resolveTableName = (tableId: string): string => {
	const table = userTables.value.find((t: any) => t.id === tableId)
	return table ? table.name : tableId
}

// Function to format property values for display
const formatPropertyValue = (key: string, value: any): string => {
	// For TABLE_READ nodes, resolve table ID to table name for the 'id' field
	if (props.step.node_id === 'TABLE_READ' && key === 'id' && typeof value === 'string') {
		return resolveTableName(value)
	}

	// For other cases, use the existing parsing logic
	return parseMentionsFromHtml(value)
}
</script>

<style scoped>
/* Add any specific styles for the card if needed */
.icon-btn {
  background: none;
  border: none;
  padding: 0.25rem;
  cursor: pointer;
  border-radius: 50%;
  transition: background-color 0.2s;
}
.icon-btn:hover {
  background-color: rgba(0, 0, 0, 0.05);
}
</style>
