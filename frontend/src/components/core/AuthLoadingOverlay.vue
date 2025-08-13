<template>
	<teleport to="body">
		<transition name="fade">
			<div v-if="authLoading" class="fixed inset-0 z-[9999] grid place-items-center bg-black/40 backdrop-blur-sm">
				<div class="bg-white rounded-xl shadow-lg p-6 w-[280px] grid place-items-center gap-3">
					<Spinner :light="false" size="32px" />
					<p class="text-sm font-semibold text-gray-800 text-center">{{ message }}</p>
				</div>
			</div>
		</transition>
	</teleport>
</template>

<script setup lang="ts">
import Spinner from '@/components/core/Spinner.vue'
import { useAuthLoading } from '@/composables/auth/loading'

const { authLoading, message } = useAuthLoading()
</script>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity .15s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>

