<template>
	<div class="bg-lighter rounded-lg p-6 border border-border">
		<div class="flex flex-col items-center text-center">
			<Database class="text-gray-300 mb-4" :size="64" />
			<h3 class="text-xl font-medium text-headline mb-2">
				No tables yet
			</h3>
			<p class="text-text-secondary mb-6 max-w-md">
				Tables help you organize structured data that can be used by AI to generate content or perform tasks.
			</p>
			<div class="flex flex-col sm:flex-row gap-4">
				<button
					class="btn-primary px-6 py-3 rounded-md flex items-center justify-center gap-2"
					@click="$emit('createNewTable')"
				>
					<PlusCircle :size="20" />
					<span>Create New Table</span>
				</button>
				<button
					class="btn-outline px-6 py-3 rounded-md flex items-center justify-center gap-2 border border-border hover:border-primary transition-colors"
					@click="$emit('createDemoTable')"
				>
					<Lightbulb :size="20" />
					<span>Try Demo Table</span>
				</button>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import { Database, PlusCircle, Lightbulb } from 'lucide-vue-next'

defineEmits<{
    (e: 'createNewTable'): void;
    (e: 'createDemoTable'): void;
}>()
</script>

<style scoped>
</style>
