<template>
	<div 
		:style="`width: ${size}px; height: ${size}px; min-width: ${size}px; min-height: ${size}px;`"
		class="flex items-center justify-center uppercase border border-line text-dark bg-light font-bold rounded-full"
	>
		<span :style="`font-size: ${size/2}px;line-height: 1em`">T</span>
	</div>
</template>

<script setup lang="ts">
defineProps({
	size: {
		required: false,
		type: Number,
		default: 28
	}
})
</script>

<style scoped>
</style>
