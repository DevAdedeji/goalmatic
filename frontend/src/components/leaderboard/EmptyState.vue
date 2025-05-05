<template>
	<div class="justify-center items-center flex flex-col text-center py-10 border border-dashed border-border rounded-lg">
		<Trophy
			class="mx-auto mb-3 text-gray-400"
			:size="40"
		/>
		<p class="text-text-secondary mb-2">
			No leaderboard data yet
		</p>
		<p class="text-sm text-text-secondary mb-4">
			Start cloning agents to see users appear on the leaderboard
		</p>
	</div>
</template>

<script setup lang="ts">
import { Trophy } from 'lucide-vue-next'
</script>

<style scoped></style>
