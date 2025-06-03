<template>
	<header class=" flex items-center justify-between py-4 md:px-5 px-4 bg-transparent border-b border-[#E9E9E9]">
		<span class="text-sm">
			Untitled Chat <span class="default-pill">Default</span>
		</span>

		<div class="btn-group">
			<button class="btn-primary gap-2 !px-4 md:!px-6" @click="$router.push('/agents/explore')">
				<Search :size="16" />
				<span class="flex">Explore Agents</span>
			</button>
			<button class="btn-outline gap-2">
				<History :size="16" />
				<span class="hidden md:flex">Chat History</span>
			</button>
		</div>
	</header>
</template>

<script setup lang="ts">
import { Search, History } from 'lucide-vue-next'
</script>

<style scoped lang="scss">
.btn-group {
	@apply flex gap-4;
	button {
		@apply p-2.5 md:px-6 md:py-[11px];
	}
}


</style>
