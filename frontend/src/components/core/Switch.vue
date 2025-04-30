<template>
	<div class="flex items-center">
		<button
			type="button"
			:disabled="disabled"
			:class="[
				'relative inline-flex h-6 w-11 items-center rounded-full transition-colors',
				modelValue ? 'bg-primary' : 'bg-gray-200',
				disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
			]"
			@click="$emit('update', !modelValue)"
		>
			<span
				:class="[
					'inline-block h-4 w-4 transform rounded-full bg-white transition-transform',
					modelValue ? 'translate-x-6' : 'translate-x-1'
				]"
			/>
		</button>
		<span v-if="label" class="ml-3 text-sm">{{ label }}</span>
	</div>
</template>

<script setup lang="ts">
defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  label: {
    type: String,
    default: ''
  },
  disabled: {
    type: Boolean,
    default: false
  }
})

defineEmits(['update'])
</script>
