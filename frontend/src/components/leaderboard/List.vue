<template>
	<section>
		<div v-if="leaderboardData.length" class="flex flex-col gap-4">
			<div class="grid grid-cols-12 gap-4 py-3 px-4 bg-gray-50 rounded-lg font-medium text-text-secondary">
				<div class="col-span-1">
					Rank
				</div>
				<div class="col-span-7">
					User
				</div>
				<div class="col-span-4 text-right">
					Points
				</div>
			</div>

			<LeaderboardCard
				v-for="(user, index) in leaderboardData"
				:key="(user as any).id"
				:user="user as Record<string, any>"
				:rank="index + 1"
			/>
		</div>
	</section>
</template>

<script setup lang="ts">
defineProps({
	leaderboardData: {
		type: Array as () => Record<string, any>[],
		required: true
	}
})
</script>

<style scoped></style>
