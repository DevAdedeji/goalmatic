<template>
	<div>
		<h2 class="text-xl font-semibold mb-4 text-headline">
			Your Flows
		</h2>
		<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
			<div v-for="i in 6" :key="i" class="bg-lighter rounded-lg p-4 border border-border">
				<div class="flex justify-between items-start mb-4">
					<Skeleton width="150px" height="20px" radius="4px" class="mb-2" />
					<div class="flex gap-1">
						<Skeleton width="30px" height="30px" radius="4px" />
						<Skeleton width="30px" height="30px" radius="4px" />
					</div>
				</div>
				<Skeleton width="100%" height="40px" radius="4px" class="mb-4" />
				<div class="flex justify-between items-center">
					<Skeleton width="60px" height="24px" radius="12px" />
					<Skeleton width="50px" height="20px" radius="4px" />
				</div>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">

</script>

<style scoped>

</style>
