<template>
	<div class="flex flex-col items-center justify-center min-h-[60vh]">
		<AlertCircle class="text-danger mb-4" :size="64" />
		<h2 class="text-2xl font-medium text-headline mb-2">
			Flow Not Found
		</h2>
		<p class="text-text-secondary mb-6">
			The flowData you are looking for does not exist or you don't have permission to view it.
		</p>
		<button class="btn-outline border border-border px-4 py-2 rounded-md" @click="$router.push('/flows')">
			Back to Flows
		</button>
	</div>
</template>

<script setup lang="ts">
import { AlertCircle } from 'lucide-vue-next'
</script>

