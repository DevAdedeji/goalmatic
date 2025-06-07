<template>
	<div class="grid grid-cols-12 gap-4 py-4 px-4 bg-white rounded-lg border border-border hover:border-primary transition-colors">
		<div class="col-span-1 flex items-center">
			<div :class="['flex items-center justify-center w-8 h-8 rounded-full font-semibold', getRankClass(rank)]">
				{{ rank }}
			</div>
		</div>
		<div class="col-span-7 flex items-center gap-3">
			<div class="w-10 h-10 rounded-full overflow-hidden">
				<img v-if="user.photo_url" :src="user.photo_url" alt="User avatar" class="w-full h-full object-cover">
				<div v-else class="w-full h-full bg-gray-200 flex items-center justify-center text-gray-500">
					{{ getUserInitials(user.name) }}
				</div>
			</div>
			<div>
				<h4 class="font-medium">
					{{ user.name }}
				</h4>
				<p class="text-sm text-text-secondary">
					{{ user.agents_cloned }} agents cloned
				</p>
			</div>
		</div>
		<div class="col-span-4 flex items-center justify-end">
			<div class="flex items-center gap-2">
				<Trophy :size="18" :class="getRankIconColor(rank)" />
				<span class="font-semibold text-lg">{{ user.points }}</span>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
const props = defineProps({
	user: {
		type: Object,
		required: true
	},
	rank: {
		type: Number,
		required: true
	}
})

const getRankClass = (rank: number) => {
	if (rank === 1) return 'bg-yellow-100 text-yellow-800'
	if (rank === 2) return 'bg-gray-100 text-gray-800'
	if (rank === 3) return 'bg-amber-100 text-amber-800'
	return 'bg-gray-50 text-gray-600'
}

const getRankIconColor = (rank: number) => {
	if (rank === 1) return 'text-yellow-500'
	if (rank === 2) return 'text-gray-500'
	if (rank === 3) return 'text-amber-500'
	return 'text-gray-400'
}

const getUserInitials = (name: string) => {
	if (!name) return '?'
	return name.split(' ').map((n) => n[0]).join('').toUpperCase().substring(0, 2)
}
</script>

<style scoped></style>
