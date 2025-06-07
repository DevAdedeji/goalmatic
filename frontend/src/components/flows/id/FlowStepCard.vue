<template>
	<div :class="[ 'px-4 py-5  rounded-lg relative w-full max-w-2xl border-[1.5px]', isTrigger ? ' border-primary ' : ' border-border']">
		<div :class="['absolute -left-2 -top-2 w-6 h-6 text-white rounded-full flex items-center justify-center font-bold',isTrigger ? 'bg-primary' : 'bg-gray-500']">
			{{ stepIndex + 1 }}
		</div>

		<!-- Step Header -->
		<div class="flex justify-between items-center mb-2">
			<h3 class="font-medium flex items-center gap-2">
				<img :src="step.icon" :alt="step.name" class="size-6 p-0.5 rounded-md">
				<span>
					<span v-if="step.parent_node_id">
						<span class="text-primary font-bold">{{ step.name.split(':')[0].trim() }}</span>
						<span class="mx-1">:</span>
					</span>
					<span class="italic">{{ step.name.split(':').pop().trim() }}</span>
				</span>
				<!-- Node Validation Status -->
				<span v-if="!isNodeValidComputed && isOwner" class="text-danger text-sm flex items-center ml-2">
					<AlertCircle :size="14" class="mr-1" />
					Invalid
				</span>
			</h3>
			<div v-if="isOwner" class="flex gap-2">
				<!-- Change Button -->
				<span v-if="props.isFlowActive" class="tooltip-wrapper">
					<button class="icon-btn disabled-btn" disabled>
						<RefreshCw :size="18" />
					</button>
					<span class="tooltip-text">Cannot change node while flow is active</span>
				</span>
				<button v-else class="icon-btn text-text-secondary hover:text-blue-500" @click="$emit('changeNode', step)">
					<RefreshCw :size="18" />
				</button>
				<!-- Edit Button -->
				<span v-if="props.isFlowActive" class="tooltip-wrapper">
					<button class="icon-btn disabled-btn" disabled>
						<Edit2 :size="18" />
					</button>
					<span class="tooltip-text">Cannot edit node while flow is active</span>
				</span>
				<button v-else class="icon-btn text-text-secondary hover:text-primary" @click="$emit('editStep', step)">
					<Edit2 :size="18" />
				</button>
				<!-- Remove Button -->
				<span v-if="props.isFlowActive" class="tooltip-wrapper">
					<button class="icon-btn disabled-btn" disabled>
						<Trash2 :size="18" />
					</button>
					<span class="tooltip-text">Cannot delete node while flow is active</span>
				</span>
				<button v-else class="icon-btn text-text-secondary hover:text-danger" @click="$emit('removeStep')">
					<Trash2 :size="18" />
				</button>
			</div>
		</div>

		<!-- Step Description -->
		<p class="text-text-secondary">
			{{ step.description }}
		</p>

		<!-- Required Props Warning -->
		<div v-if="!isNodeValidComputed && isOwner" class="mt-3 p-2 bg-danger-50 border border-danger-200 rounded-md text-danger-800 text-sm">
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
					<span class="text-gray-600 truncate flex-1">{{ parseMentionsFromHtml(value) }}</span>
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
import { Edit2, Trash2, RefreshCw, AlertCircle } from 'lucide-vue-next'
import { computed } from 'vue'
import { isNodeValid, getMissingRequiredProps } from '@/composables/dashboard/flows/nodes/nodeOperations'

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
	}
})

// Check if node is valid - now using centralized function
const isNodeValidComputed = computed(() => {
	return isNodeValid(props.step)
})

// Access isOwner prop
const isOwner = computed(() => props.isOwner)

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

// Define Emits
defineEmits([
	'editStep',
	'removeStep',
	'changeNode'
])
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
.disabled-btn {
  opacity: 0.4;
  cursor: not-allowed !important;
  pointer-events: none;
}
.tooltip-wrapper {
  position: relative;
  display: inline-block;
}
.tooltip-text {
  visibility: hidden;
  opacity: 0;
  width: max-content;
  background-color: #333;
  color: #fff;
  text-align: center;
  border-radius: 4px;
  padding: 4px 8px;
  position: absolute;
  z-index: 10;
  bottom: 120%;
  left: 50%;
  transform: translateX(-50%);
  font-size: 12px;
  transition: opacity 0.2s;
  pointer-events: none;
}
.tooltip-wrapper:hover .tooltip-text {
  visibility: visible;
  opacity: 1;
}
</style>
