<template>
	<div class="flex justify-center items-center min-h-[50vh]">
		<div class="max-w-[600px] text-center flex flex-col items-center">
			<div class="bg-lighter p-6 rounded-xl mb-6 inline-block">
				<ActivitySquare class="text-primary" :size="64" />
			</div>
			<h1 class="text-3xl mb-4 text-headline font-bold">
				No Flows Yet
			</h1>
			<p class="text-text-secondary mb-8 text-lg">
				Create your first flow to automate tasks and streamline your productivity.
			</p>
			<div class="flex flex-col sm:flex-row gap-4">
				<button class="btn-primary px-6 py-3 rounded-md flex items-center justify-center gap-2" :disabled="creatingFlow" @click="emit('createNewFlow')">
					<PlusCircle v-if="!creatingFlow" :size="20" />
					<span v-else class="loading-spinner small" />
					<span>{{ creatingFlow ? 'Creating...' : 'Create New Flow' }}</span>
				</button>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import { ActivitySquare, PlusCircle } from 'lucide-vue-next'
const emit = defineEmits(['createNewFlow'])

defineProps({
	creatingFlow: {
		type: Boolean,
		default: false
	}
})
</script>

<style scoped>

</style>
