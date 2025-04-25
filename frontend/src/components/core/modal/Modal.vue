<template>
	<transition
		name="fade"
		appear
		@after-enter="modalType = type"
	>
		<div
			:close="closeModal"
			:class="[
				type == 'popup' ? 'bg-modal' : 'bg-sidebar',
				'transition-all modal-background',
			]"
			@click.self="autoClose ? close($el) : null"
		>
			<transition name="modal" appear @after-leave="closeModal">
				<div v-if="modalType == 'popup'" :class="[isFullHeight? `isFullHeight ${computedWidth}`:'isNotFullHeight','modal']">
					<header class="modal-title flex justify-between w-full items-center">
						<span :class="[noClose?'text-center w-full':'text-start font-semibold']">{{ title }}</span>
						<X
							v-if="!noClose"
							name="close"
							class="text-dark w-5 cursor-pointer  rounded-md"
							@click="closeModalType()"
						/>
					</header>
					<div class="w-full relative">
						<slot />
					</div>
				</div>
			</transition>
			<transition name="slide" appear @after-leave="closeModal">
				<div v-if="modalType == 'sidebar'" class="sidebar">
					<header class="modal-title flex justify-between w-full items-center">
						<span :class="[noClose?'text-center w-full':'text-start font-semibold']">{{ title }}</span>
						<X
							v-if="!noClose"
							name="close"
							class="text-dark w-5 cursor-pointer  rounded-md"
							@click="closeModalType()"
						/>
					</header>
					<slot />
				</div>
			</transition>
			<transition name="glide_up" appear @after-leave="closeModal">
				<div v-if="modalType == 'bottom_bar'" class="bottombar">
					<slot />
				</div>
			</transition>
		</div>
	</transition>
</template>

<script lang="ts" setup>

import { PropType, watch, computed } from 'vue'
import { X } from 'lucide-vue-next'
import { modal, modalType, closeModalType, closeAllExtremes } from '@/composables/core/modal'


watch(() => useRoute().path, (from, to) => {
	closeAllExtremes()
})
const emit = defineEmits(['close'])
type modalTypes = 'popup' | 'sidebar' | 'bottom_bar';
type sizeTypes = 'sm' | 'md' | 'lg' | 'xl' | 'xxl'| 'full';

const computedWidth = computed(() => {
	switch (props.size) {
		case 'sm':
			return 'w-[300px]'
		case 'md':
			return 'w-[470px]'
		case 'lg':
			return 'w-[500px]'
		case 'xl':
			return 'w-[800px]'
		case 'xxl':
			return 'w-[1024px]'
		case 'full':
			return 'w-full'
		default:
			return 'w-[400px]'
	}
})



const props = defineProps({
	size: {
		default: 'md',
		type: String as PropType<sizeTypes>,
		required: false
	},
	noClose: {
		default: false,
		type: Boolean,
		required: false
	},
	autoClose: {
		default: true,
		type: Boolean,
		required: false
	},
	propsModal: {
		default: '',
		type: String,
		required: false
	},
	title: {
		default: 'Default Title',
		type: String,
		required: false
	},
	isFullHeight: {
		default: true,
		type: Boolean,
		required: false
	},
	type: {
		default: 'popup',
		type: String as PropType<modalTypes>,
		required: false
	}

})

const close = (e) => {
	if (
		typeof e.className === 'string' &&
		e.className.includes('modal-background')
	) {
		closeModalType()
		emit('close')
	}
}

const closeModal = () => {
	emit('close')
	if (props?.propsModal) {
		modal.close(props.propsModal)
	} else {
		console.warn('Modal closed without a propsModal ID.')
	}
}

</script>

<style scoped lang="scss">
.sidebar{
	@apply bg-light w-[448px] max-w-[90vw] h-screen fixed right-0 p-4;
	header{
		// @apply rounded-none
	}
}
    .bottombar {
        @apply bg-light rounded-t-xl flex flex-col gap-2 sm:hidden fixed inset-x-0 bottom-[54px] w-full border border-dark p-4 pb-0 pt-6;
    }
.generator_tw{
	@apply sm:w-[700px] sm:w-[400px]
}
.isFullHeight {
	@apply h-screen sm:h-auto
}
.isNotFullHeight{
	@apply h-auto w-[90vw] sm:w-[470px] rounded-sm;
	border-radius: 0.375rem;
	height: auto !important;
}

.bg-sidebar {
	position: fixed;
	top: 0;
	left: 0;
	background-color: rgba(0, 0, 0, 0.4);
	width: 100vw;
	max-width: 100vw;
	min-height: 100vh;
	z-index: 30;
	backdrop-filter: blur(1.5px);
}

.modal-enter-active,
.modal-leave-active {
	transition: all 0.23s linear;
}
.modal-enter-from,
.modal-leave-to {
	opacity: 0;
	@media screen and (max-width: 640px) {
		transform: translateY(500px);
	}
}
.slide-enter-active,
.slide-leave-active {
	transition: all 0.25s ease;
}
.slide-enter-from,
.slide-leave-to {
	transform: translateX(500px);
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}

.fade-enter-active, .fade-leave-active {
  transition: 0.125s opacity ease-out;
}
.glide_up-enter-active,
.glide_up-leave-active {
	transition: all 0.25s linear;
}
.glide_up-enter-from,
.glide_up-leave-to {
	opacity: 0;
	transform: translateY(500px);
}
</style>
