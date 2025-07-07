<template>
	<div class="agent-header-container">
		<header class="flex items-center justify-between py-4 md:px-5 px-4 bg-transparent border-b border-[#E9E9E9]">
			<span class="text-sm">
				Untitled Chat <span class="default-pill">Draft</span>
			</span>

			<div class="btn-group">
				<button class="btn-primary gap-2 !px-4 md:!px-6">
					<File :size="16" />
					<span class="flex">Save</span>
				</button>
			</div>
		</header>
	</div>
</template>

<script setup lang="ts">
import { File } from 'lucide-vue-next'


</script>

<style scoped lang="scss">
.agent-header-container {
	position: relative;
}

.btn-group {
	@apply flex gap-4;
	button {
		@apply p-2.5 md:px-6 md:py-[11px];
		transition: all 0.2s ease;

		&.active {
			@apply bg-primary text-white;
			transform: scale(0.98);
		}

		&:hover {
			transform: translateY(-1px);
		}

		&:active {
			transform: scale(0.96);
		}
	}
}





.default-pill {
	@apply bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs ml-2;
}




/* Smooth button state transitions */
.btn-outline {
	position: relative;
	overflow: hidden;

	&::before {
		content: '';
		position: absolute;
		top: 0;
		left: -100%;
		width: 100%;
		height: 100%;
		background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
		transition: left 0.5s;
	}

	&:hover::before {
		left: 100%;
	}
}
</style>
