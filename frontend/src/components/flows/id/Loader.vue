<template>
	<div class="flex flex-col gap-4 max-w-screen">
		<Skeleton width="100px" height="36px" radius="4px" />
		<Skeleton width="250px" height="20px" radius="4px" />
		<div class="mt-8">
			<Skeleton width="150px" height="24px" radius="4px" class="mb-4" />
			<div class="grid gap-4">
				<div v-for="i in 3" :key="i" class="border border-border p-4 rounded-lg">
					<Skeleton width="200px" height="24px" radius="4px" class="mb-2" />
					<Skeleton width="100%" height="40px" radius="4px" />
				</div>
			</div>
		</div>
	</div>
</template>

