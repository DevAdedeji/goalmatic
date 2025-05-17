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
				<span v-if="!isNodeValid" class="text-danger text-sm flex items-center ml-2">
					<AlertCircle :size="14" class="mr-1" />
					Invalid
				</span>
			</h3>
			<div class="flex gap-2">
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
		<div v-if="!isNodeValid" class="mt-3 p-2 bg-danger-50 border border-danger-200 rounded-md text-danger-800 text-sm">
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
				<div v-for="(value, key) in step.propsData" :key="key" class="flex gap-2 text-sm">
					<span class="font-medium text-gray-700">{{ key }}:</span>
					<span class="text-gray-600 truncate">{{ value }}</span>
				</div>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import { Edit2, Trash2, RefreshCw, AlertCircle } from 'lucide-vue-next'
import { computed } from 'vue'

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
	}
})

// Check if node is valid
const isNodeValid = computed(() => {
	const node = props.step
	const nodeProps = node.props || []

	// If no props or no required props, node is valid
	if (!nodeProps.length) return true

	// Check for missing required props
	for (const prop of nodeProps) {
		if (prop.required) {
			const propValue = node.propsData?.[prop.key]
			if (propValue === undefined || propValue === null || propValue === '') {
				return false
			}
		}
	}

	return true
})

// Get missing required props
const missingRequiredProps = computed(() => {
	const nodeProps = props.step.props || []

	return nodeProps.filter((prop) => {
		if (prop.required) {
			const propValue = props.step.propsData?.[prop.key]
			return propValue === undefined || propValue === null || propValue === ''
		}
		return false
	})
})

// Check if node has any props data to display
const hasPropsData = computed(() => {
	return props.step.propsData && Object.keys(props.step.propsData).length > 0
})

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
