<template>
	<section class="mb-8">
		<div class="flex justify-between items-center flex-wrap gap-4">
			<div class="flex flex-col gap-1">
				<h3 class="text-headline font-semibold text-2xl md:text-[28px]">
					Welcome to your flows
				</h3>
				<p class="text-base text-[#37363D]">
					Create and manage automated workflows to streamline your productivity and connect your tasks.
				</p>
			</div>
			<button class="custom-btn gap-2 w-full lg:w-auto" :disabled="creatingFlow" @click="emit('createNewFlow')">
				<span>{{ creatingFlow ? 'Creating...' : 'Create a new flow' }}</span>
				<ArrowRight v-if="!creatingFlow" :size="15" />
			</button>
		</div>
	</section>
</template>

<script setup lang="ts">
import { ArrowRight } from 'lucide-vue-next'
const emit = defineEmits(['createNewFlow'])

defineProps({
	creatingFlow: {
		type: Boolean,
		default: false
	}
})
</script>
