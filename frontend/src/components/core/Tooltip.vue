<template>
	<div class="tooltip-container">
		<div ref="triggerRef" class="tooltip-trigger">
			<slot name="trigger" />
		</div>

		<Teleport to="body" :disabled="disabled">
			<div
				v-if="isOpen"
				ref="contentRef"
				class="tooltip-content"
				:class="placementClass"
				:style="positionStyle"
				@mouseenter="openTooltip"
				@mouseleave="closeTooltip"
			>
				<slot name="content" />
				<div v-if="showArrow" class="tooltip-arrow" :style="arrowStyle" />
			</div>
		</Teleport>
	</div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onBeforeUnmount, nextTick } from 'vue'

const props = defineProps({
  placement: {
    type: String,
    default: 'top',
    validator: (value: string) => ['top', 'bottom', 'left', 'right'].includes(value)
  },
  offset: {
    type: Number,
    default: 8
  },
  showArrow: {
    type: Boolean,
    default: true
  },
  disabled: {
    type: Boolean,
    default: false
  },
  openDelay: {
    type: Number,
    default: 0
  },
  closeDelay: {
    type: Number,
    default: 0
  }
})

const isOpen = ref(false)
const triggerRef = ref<HTMLElement | null>(null)
const contentRef = ref<HTMLElement | null>(null)

let openTimeout: ReturnType<typeof setTimeout> | null = null
let closeTimeout: ReturnType<typeof setTimeout> | null = null

// Calculate the position for the tooltip
const calculatePosition = () => {
  if (!triggerRef.value || !contentRef.value) return { top: 0, left: 0 }

  const triggerRect = triggerRef.value.getBoundingClientRect()
  const contentRect = contentRef.value.getBoundingClientRect()
  const scrollY = window.scrollY || document.documentElement.scrollTop
  const scrollX = window.scrollX || document.documentElement.scrollLeft

  let top = 0
  let left = 0

  switch (props.placement) {
    case 'top':
      top = triggerRect.top + scrollY - contentRect.height - props.offset
      left = triggerRect.left + scrollX + (triggerRect.width / 2) - (contentRect.width / 2)
      break
    case 'bottom':
      top = triggerRect.bottom + scrollY + props.offset
      left = triggerRect.left + scrollX + (triggerRect.width / 2) - (contentRect.width / 2)
      break
    case 'left':
      top = triggerRect.top + scrollY + (triggerRect.height / 2) - (contentRect.height / 2)
      left = triggerRect.left + scrollX - contentRect.width - props.offset
      break
    case 'right':
      top = triggerRect.top + scrollY + (triggerRect.height / 2) - (contentRect.height / 2)
      left = triggerRect.right + scrollX + props.offset
      break
  }

  // Keep tooltip within viewport
  const viewportWidth = window.innerWidth
  const viewportHeight = window.innerHeight

  if (left < 0) left = 0
  if (left + contentRect.width > viewportWidth) left = viewportWidth - contentRect.width
  if (top < 0) top = 0
  if (top + contentRect.height > viewportHeight + scrollY) top = viewportHeight + scrollY - contentRect.height

  return { top, left }
}

// Calculate position for the arrow
const calculateArrowPosition = () => {
  if (!triggerRef.value || !contentRef.value) return { top: 0, left: 0 }

  const triggerRect = triggerRef.value.getBoundingClientRect()
  const contentRect = contentRef.value.getBoundingClientRect()

  let top = 0
  let left = 0

  switch (props.placement) {
    case 'top':
      top = contentRect.height - 5
      left = (contentRect.width / 2) - 5
      break
    case 'bottom':
      top = -10
      left = (contentRect.width / 2) - 5
      break
    case 'left':
      top = (contentRect.height / 2) - 5
      left = contentRect.width - 1
      break
    case 'right':
      top = (contentRect.height / 2) - 5
      left = -10
      break
  }

  return { top, left }
}

const positionStyle = computed(() => {
  const { top, left } = calculatePosition()
  return {
    top: `${top}px`,
    left: `${left}px`
  }
})

const arrowStyle = computed(() => {
  const { top, left } = calculateArrowPosition()
  return {
    top: `${top}px`,
    left: `${left}px`
  }
})

const placementClass = computed(() => {
  return `tooltip-${props.placement}`
})

// Event handlers
const openTooltip = () => {
  if (closeTimeout) {
    clearTimeout(closeTimeout)
    closeTimeout = null
  }

  if (!isOpen.value) {
    if (props.openDelay > 0) {
      openTimeout = setTimeout(() => {
        isOpen.value = true
      }, props.openDelay)
    } else {
      isOpen.value = true
    }
  }
}

const closeTooltip = () => {
  if (openTimeout) {
    clearTimeout(openTimeout)
    openTimeout = null
  }

  if (isOpen.value) {
    if (props.closeDelay > 0) {
      closeTimeout = setTimeout(() => {
        isOpen.value = false
      }, props.closeDelay)
    } else {
      isOpen.value = false
    }
  }
}

// Update position when tooltip becomes visible
watch(isOpen, (newValue) => {
  if (newValue) {
    // Use nextTick to wait for DOM update
    nextTick(() => {
      if (contentRef.value) {
        const { top, left } = calculatePosition()
        contentRef.value.style.top = `${top}px`
        contentRef.value.style.left = `${left}px`
      }
    })
  }
})

// Bind events
onMounted(() => {
  if (triggerRef.value) {
    triggerRef.value.addEventListener('mouseenter', openTooltip)
    triggerRef.value.addEventListener('mouseleave', closeTooltip)
    triggerRef.value.addEventListener('focus', openTooltip)
    triggerRef.value.addEventListener('blur', closeTooltip)
  }

  // Close on escape key
  const handleEscKey = (e: KeyboardEvent) => {
    if (e.key === 'Escape' && isOpen.value) {
      isOpen.value = false
    }
  }

  document.addEventListener('keydown', handleEscKey)

  // Cleanup
  onBeforeUnmount(() => {
    if (triggerRef.value) {
      triggerRef.value.removeEventListener('mouseenter', openTooltip)
      triggerRef.value.removeEventListener('mouseleave', closeTooltip)
      triggerRef.value.removeEventListener('focus', openTooltip)
      triggerRef.value.removeEventListener('blur', closeTooltip)
    }
    document.removeEventListener('keydown', handleEscKey)

    if (openTimeout) clearTimeout(openTimeout)
    if (closeTimeout) clearTimeout(closeTimeout)
  })
})
</script>

<style scoped>
.tooltip-container {
  display: inline-block;
  position: relative;
}

.tooltip-trigger {
  display: inline-block;
}

.tooltip-content {
  position: fixed;
  z-index: 9999;
  background-color: #333;
  color: white;
  padding: 6px 10px;
  border-radius: 4px;
  font-size: 14px;
  max-width: 250px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.15);
  pointer-events: auto;
  cursor: default;
}

.tooltip-arrow {
  position: absolute;
  width: 10px;
  height: 10px;
  background: #333;
  transform: rotate(45deg);
}

.tooltip-top .tooltip-arrow {
  bottom: -5px;
}

.tooltip-bottom .tooltip-arrow {
  top: -5px;
}

.tooltip-left .tooltip-arrow {
  right: -5px;
}

.tooltip-right .tooltip-arrow {
  left: -5px;
}
</style>
