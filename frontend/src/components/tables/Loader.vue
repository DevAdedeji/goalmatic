<template>
	<div class="space-y-6">
		<!-- Skeleton for table cards -->
		<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
			<div v-for="i in 3" :key="i" class="bg-lighter rounded-lg p-4 border border-border">
				<div class="flex justify-between items-start mb-2">
					<Skeleton width="60%" height="24px" radius="4px" />
					<div class="flex gap-1">
						<Skeleton width="24px" height="24px" radius="4px" />
						<Skeleton width="24px" height="24px" radius="4px" />
					</div>
				</div>
				<Skeleton width="90%" height="16px" radius="4px" class="mb-1" />
				<Skeleton width="70%" height="16px" radius="4px" class="mb-3" />
				<div class="flex justify-between items-center">
					<div class="flex items-center gap-2">
						<Skeleton width="60px" height="20px" radius="12px" />
						<Skeleton width="40px" height="16px" radius="4px" />
					</div>
					<Skeleton width="40px" height="16px" radius="4px" />
				</div>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import Skeleton from '@/components/core/skeleton.vue'
</script>

<style scoped>
</style>
