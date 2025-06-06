<template>
	<div class="agent-header-container">
		<header class="flex items-center justify-between py-4 md:px-5 px-4 bg-transparent border-b border-[#E9E9E9]">
			<span class="text-sm">
				Untitled Chat <span class="default-pill">Default</span>
			</span>

			<div class="btn-group">
				<button class="btn-primary gap-2 !px-4 md:!px-6" @click="$router.push('/agents/explore')">
					<Search :size="16" />
					<span class="flex">Explore Agents</span>
				</button>
				<button
					class="btn-outline gap-2"
					:class="{ 'active': showChatHistory }"
					@click="toggleChatHistory"
				>
					<History :size="16" />
					<span class="hidden md:flex">Chat History</span>
				</button>
			</div>
		</header>

		<!-- Chat History Sidebar/Bottom Sheet with Transition -->
		<Transition
			name="sidebar"
			enter-active-class="sidebar-enter-active"
			leave-active-class="sidebar-leave-active"
			enter-from-class="sidebar-enter-from"
			enter-to-class="sidebar-enter-to"
			leave-from-class="sidebar-leave-from"
			leave-to-class="sidebar-leave-to"
		>
			<div
				v-if="showChatHistory"
				class="chat-history-sidebar"
			>
				<div class="sidebar-header">
					<!-- Mobile handle for bottom sheet -->
					<!-- <div class="mobile-handle md:hidden" /> -->
					<h2 class="sidebar-title">
						Chat History
					</h2>
					<button
						class="close-button"
						aria-label="Close chat history"
						@click="toggleChatHistory"
					>
						<X :size="20" />
					</button>
				</div>
				<div class="sidebar-content">
					<ChatHistory />
				</div>
			</div>
		</Transition>

		<!-- Overlay with Transition -->
		<Transition
			name="overlay"
			enter-active-class="overlay-enter-active"
			leave-active-class="overlay-leave-active"
			enter-from-class="overlay-enter-from"
			enter-to-class="overlay-enter-to"
			leave-from-class="overlay-leave-from"
			leave-to-class="overlay-leave-to"
		>
			<div
				v-if="showChatHistory"
				class="sidebar-overlay"
				@click="toggleChatHistory"
			/>
		</Transition>
	</div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Search, History, X } from 'lucide-vue-next'
import ChatHistory from '@/components/assistant/ChatHistory.vue'

// State for toggling chat history
const showChatHistory = ref(false)

const toggleChatHistory = () => {
	showChatHistory.value = !showChatHistory.value
}
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

.chat-history-sidebar {
	position: fixed;
	z-index: 5;
	background: white;
	display: flex;
	flex-direction: column;

	/* Desktop: Right sidebar */
	@media (min-width: 768px) {
		top: 0px;
		right: 0;
		width: 100%;
		max-width: 400px;
		height: 100vh;
		border-left: 1px solid #E4E7EC;
		box-shadow: -4px 0 24px rgba(0, 0, 0, 0.1);
	}

	/* Mobile: Bottom sheet */
	@media (max-width: 767px) {
		bottom: 0;
		left: 0;
		right: 0;
		width: 100%;
		height: 85vh;
		max-height: 85vh;
		border-top-left-radius: 20px;
		border-top-right-radius: 20px;
		border-top: 1px solid #E4E7EC;
		box-shadow: 0 -4px 24px rgba(0, 0, 0, 0.15);
	}
}

.sidebar-header {
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 22.5px 16px;
	border-bottom: 1px solid #E4E7EC;
	flex-shrink: 0;
	background: white;
	position: relative;

	/* Mobile: Add padding for handle */
	@media (max-width: 767px) {
		@apply rounded-t-3xl;

	}
}

.mobile-handle {
	position: absolute;
	top: 8px;
	left: 50%;
	transform: translateX(-50%);
	width: 40px;
	height: 4px;
	background: #D1D5DB;
	border-radius: 2px;
}

.sidebar-title {
	font-size: 18px;
	font-weight: 600;
	color: #111827;
	margin: 0;
}

.close-button {
	display: flex;
	align-items: center;
	justify-content: center;
	width: 32px;
	height: 32px;
	border: none;
	border-radius: 6px;
	color: #6B7280;
	cursor: pointer;
	transition: all 0.2s ease;

	&:hover {
		background: #E5E7EB;
		color: #374151;
		transform: scale(1.05);
	}

	&:active {
		transform: scale(0.95);
	}
}

.sidebar-content {
	flex: 1;
	overflow: hidden;
}

.sidebar-overlay {
	position: fixed;
	top: 0;
	left: 0;
	width: 100%;
	height: 100%;
	background: rgba(0, 0, 0, 0.1);
	z-index: 3;
}

.default-pill {
	@apply bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs ml-2;
}

/* Desktop Sidebar Animation Classes */
@media (min-width: 768px) {
	.sidebar-enter-active {
		transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
	}

	.sidebar-leave-active {
		transition: all 0.25s cubic-bezier(0.25, 0.8, 0.25, 1);
	}

	.sidebar-enter-from {
		transform: translateX(100%);
		opacity: 0;
	}

	.sidebar-enter-to {
		transform: translateX(0);
		opacity: 1;
	}

	.sidebar-leave-from {
		transform: translateX(0);
		opacity: 1;
	}

	.sidebar-leave-to {
		transform: translateX(100%);
		opacity: 0.8;
	}
}

/* Mobile Bottom Sheet Animation Classes */
@media (max-width: 767px) {
	.sidebar-enter-active {
		transition: all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1);
	}

	.sidebar-leave-active {
		transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
	}

	.sidebar-enter-from {
		transform: translateY(100%);
		opacity: 0;
	}

	.sidebar-enter-to {
		transform: translateY(0);
		opacity: 1;
	}

	.sidebar-leave-from {
		transform: translateY(0);
		opacity: 1;
	}

	.sidebar-leave-to {
		transform: translateY(100%);
		opacity: 0.8;
	}
}

/* Overlay Animation Classes */
.overlay-enter-active {
	transition: opacity 0.3s ease;
}

.overlay-leave-active {
	transition: opacity 0.25s ease;
}

.overlay-enter-from {
	opacity: 0;
}

.overlay-enter-to {
	opacity: 1;
}

.overlay-leave-from {
	opacity: 1;
}

.overlay-leave-to {
	opacity: 0;
}

/* Additional smooth animations for content */
.sidebar-enter-active .sidebar-header,
.sidebar-enter-active .sidebar-content {
	transition: all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1);
	transition-delay: 0.1s;
}

.sidebar-enter-from .sidebar-header {
	transform: translateY(-20px);
	opacity: 0;
}

.sidebar-enter-from .sidebar-content {
	transform: translateY(20px);
	opacity: 0;
}

.sidebar-enter-to .sidebar-header,
.sidebar-enter-to .sidebar-content {
	transform: translateY(0);
	opacity: 1;
}

/* Mobile specific content animations */
@media (max-width: 767px) {
	.sidebar-enter-from .sidebar-header {
		transform: translateY(10px);
		opacity: 0;
	}

	.sidebar-enter-from .sidebar-content {
		transform: translateY(30px);
		opacity: 0;
	}
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
