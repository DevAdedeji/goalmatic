<template>
	<PopoverRoot :modal="modal">
		<PopoverTrigger as-child>
			<slot name="trigger" />
		</PopoverTrigger>
		<PopoverPortal>
			<PopoverContent
				:side="side"
				:side-offset="sideOffset"
				:align="align"
				:align-offset="alignOffset"
				:class="[
					'radix-popover-content', // Base class for potential global styling
					'rounded p-2 bg-white shadow-[0_10px_38px_-10px_hsla(206,22%,7%,.35),0_10px_20px_-15px_hsla(206,22%,7%,.2)] focus:shadow-[0_10px_38px_-10px_hsla(206,22%,7%,.35),0_10px_20px_-15px_hsla(206,22%,7%,.2),0_0_0_2px_theme(colors.violet7)] will-change-[transform,opacity] data-[state=open]:data-[side=top]:animate-slideDownAndFade data-[state=open]:data-[side=right]:animate-slideLeftAndFade data-[state=open]:data-[side=bottom]:animate-slideUpAndFade data-[state=open]:data-[side=left]:animate-slideRightAndFade z-50', // Added z-index
					contentClass // Allow passing custom classes
				]"
				:style="contentStyle"
			>
				<slot name="content" />
				<PopoverArrow v-if="showArrow" class="fill-white" :width="arrowWidth" :height="arrowHeight" />
				<PopoverClose v-if="showClose" class="absolute top-1 right-1 inline-flex items-center justify-center rounded-full p-1 focus:outline-none focus-visible:ring focus-visible:ring-purple-500 focus-visible:ring-opacity-75" aria-label="Close">
					<slot name="closeIcon">
						<!-- Default close icon, can be overridden -->
						<svg class="h-4 w-4 text-gray-500 hover:text-gray-700" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
						</svg>
					</slot>
				</PopoverClose>
			</PopoverContent>
		</PopoverPortal>
	</PopoverRoot>
</template>

<script setup lang="ts">
import {
  PopoverRoot,
  PopoverTrigger,
  PopoverPortal,
  PopoverContent,
  PopoverArrow,
  PopoverClose,
  type PopoverContentProps
} from 'radix-vue'
import { type StyleValue } from 'vue'

interface PopoverProps {
  side?: PopoverContentProps['side']
  sideOffset?: number
  align?: PopoverContentProps['align']
  alignOffset?: number
  showArrow?: boolean
  arrowWidth?: number
  arrowHeight?: number
  showClose?: boolean
  contentClass?: string | string[] | object // Allow passing custom classes for content
contentStyle?: StyleValue // Allow passing custom styles for content
  modal?: boolean
}

withDefaults(defineProps<PopoverProps>(), {
  side: 'bottom',
  sideOffset: 5,
  align: 'center',
  alignOffset: 0,
  showArrow: true,
  arrowWidth: 10,
  arrowHeight: 5,
  showClose: false, // Default to false, can be enabled via prop
    contentClass: '',
    modal: true,
  contentStyle: () => ({})
})
</script>

<style>
/* Optional: Add base styles or animations if needed */
/* Example animations from Radix Vue docs */
@keyframes slideUpAndFade {
  from {
    opacity: 0;
    transform: translateY(2px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes slideRightAndFade {
  from {
    opacity: 0;
    transform: translateX(-2px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes slideDownAndFade {
  from {
    opacity: 0;
    transform: translateY(-2px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes slideLeftAndFade {
  from {
    opacity: 0;
    transform: translateX(2px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.radix-popover-content[data-state='open'][data-side='top'] {
  animation: slideDownAndFade 400ms cubic-bezier(0.16, 1, 0.3, 1);
}
.radix-popover-content[data-state='open'][data-side='right'] {
  animation: slideLeftAndFade 400ms cubic-bezier(0.16, 1, 0.3, 1);
}
.radix-popover-content[data-state='open'][data-side='bottom'] {
  animation: slideUpAndFade 400ms cubic-bezier(0.16, 1, 0.3, 1);
}
.radix-popover-content[data-state='open'][data-side='left'] {
  animation: slideRightAndFade 400ms cubic-bezier(0.16, 1, 0.3, 1);
}
</style>
