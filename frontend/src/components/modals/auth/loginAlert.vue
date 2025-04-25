<template>
	<Modal
		modal="$atts.modal"
		title="Sign in"
		:is-full-height="false"
		:props-modal="propsModal"
	>
		<p class="text-dark text-lg tracking-[0.1rem] text-center">
			you need to sign in to perform this action
		</p>

		<div class="flex flex-col mt-5">
			<button class="btn-primary " :disabled="loading" @click="googleSignin(true)">
				<span v-if="!loading"> sign in</span>
				<Spinner v-else />
			</button>
		</div>
	</Modal>
</template>

<script setup lang="ts">
import { useAuthModal } from '@/composables/core/modals'
import { useSignin } from '@/composables/auth/auth'
import Modal from '@/components/core/modal/Modal.vue'

const { googleSignin, loading } = useSignin()

defineProps({
	payload: {
		type: Object as PropType<Record<string, any> | null>,
		default: null,
		required: false
	},
	propsModal: {
		type: String,
		required: false // Adjust as needed
	}
})
</script>

<style>

</style>
