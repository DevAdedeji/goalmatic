<template>
	<Modal
		modal="$atts.modal"
		:title="title"
		:auto-close="false"
		:no-close="true"
		:props-modal="propsModal"
	>
		<p class="text-dark text-lg tracking-[0.1rem] text-center">
			{{ message }}
		</p>

		<div class="flex items-center gap-10  w-full mt-6">
			<button class="btn-primary hover:bg-transparent" :disabled="true">
				<Spinner class="!border-t-dark !border-[#0c030366]" />
			</button>
		</div>
	</Modal>
</template>

<script setup lang="ts">
import { useLoadingNotification } from '@/composables/core/verificationLoader'

const { message, title } = useLoadingNotification()

defineProps({
	payload: {
		type: Object as PropType<Record<string, any> | null>,
		default: null,
		required: false
	},
	propsModal: {
		type: String,
		required: false
	}
})
</script>

<style>

</style>
