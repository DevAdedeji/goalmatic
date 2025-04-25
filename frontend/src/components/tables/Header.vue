<template>
	<section class="mb-8">
		<div class="flex justify-between items-center flex-wrap gap-4">
			<div class="flex flex-col gap-1">
				<h3 class="text-headline font-semibold text-2xl md:text-[28px]">
					Welcome to your tables
				</h3>
				<p class="text-base text-[#37363D]">
					Create and manage data tables to organize your information and help AI generate structured data.
				</p>
			</div>
			<button class="btn-primary gap-2 w-full lg:w-auto" :disabled="creatingTable" @click="$emit('createNewTable')">
				<span>{{ creatingTable ? 'Creating...' : 'Create a new table' }}</span>
				<ArrowRight v-if="!creatingTable" :size="15" />
				<span v-else class="loading-spinner" />
			</button>
		</div>
	</section>
</template>

<script setup lang="ts">
import { ArrowRight } from 'lucide-vue-next'

defineProps<{
    creatingTable: boolean;
}>()

defineEmits<{
    (e: 'createNewTable'): void;
}>()
</script>

<style scoped>
.loading-spinner {
    @apply inline-block h-4 w-4 border-2 border-t-transparent border-white rounded-full animate-spin;
}
</style>
