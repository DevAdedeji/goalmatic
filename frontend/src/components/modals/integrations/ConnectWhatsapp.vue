<template>
	<Modal
		modal="$atts.modal"
		title="Connect Whatsapp"
		:is-full-height="false"
		:auto-close="false"
		:props-modal="propsModal"
	>
		<form class="auth-form mt-4 p-1" @submit.prevent="step === 1 ? sendOTP() : confirmOTP()">
			<div v-if="step === 1" class="field relative">
				<label for="start">Phone Number</label>
				<PhoneInput v-model="phoneNumber" />
			</div>
			<div v-if="step === 2" class="w-auto mr-auto">
				<OTPInput v-model="otp" :length="4" container-class="md:w-80 w-60" />
			</div>


			<div class="grid grid-cols-1 gap-4 mt-6 w-full ">
				<button class="btn-primary text-light" :disabled="verificationLoading">
					<span v-if="!verificationLoading"> {{ step === 1 ? 'Send OTP to whatsapp' : 'Confirm OTP and link' }} </span>
					<Spinner v-else />
				</button>
			</div>
		</form>
	</Modal>
</template>

<script setup lang="ts">
import { useLinkWhatsapp } from '@/composables/dashboard/integrations/whatsapp/link'

const { verificationLoading, step, sendOTP, confirmOTP, phoneNumber, otp } = useLinkWhatsapp()

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
