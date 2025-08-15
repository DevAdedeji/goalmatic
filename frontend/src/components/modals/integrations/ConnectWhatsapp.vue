<template>
	<Modal
		modal="$atts.modal"
		title="Connect Whatsapp"
		:is-full-height="false"
		:auto-close="false"
		:props-modal="propsModal"
	>
		<form class="auth-form mt-4 p-1 pb-24 sm:pb-0	" @submit.prevent="step === 1 ? sendOTP() : confirmOTP()">
			<div v-if="step === 1" class="field relative">
				<label for="start">Phone Number</label>
				<PhoneInput v-model="phoneNumber" />
			</div>
			<div v-if="step === 2" class="w-auto mr-auto">
				<OTPInput v-model="otp" :length="4" container-class="md:w-80 w-60" />
			</div>


			<div class="hidden sm:block mt-6 w-full">
				<div v-if="step === 1" class="grid grid-cols-1 gap-4">
					<button class="btn-primary text-light" :disabled="verificationLoading">
						<span v-if="!verificationLoading"> Send OTP to whatsapp </span>
						<Spinner v-else />
					</button>
				</div>
				<div v-else class="grid grid-cols-3 gap-3">
					<button type="button" class="btn-outline" :disabled="verificationLoading" @click="goBack">
						Back
					</button>
					<button type="button" class="btn-outline" :disabled="verificationLoading" @click="sendOTP">
						Resend OTP
					</button>
					<button type="button" class="btn-primary text-light" :disabled="verificationLoading" @click="confirmOTP">
						<span v-if="!verificationLoading"> Confirm OTP and link </span>
						<Spinner v-else />
					</button>
				</div>
			</div>
		</form>
		<div class="fixed inset-x-0 bottom-0 sm:hidden bg-light border-t border-border p-3">
			<div v-if="step === 1" class="grid grid-cols-1 gap-3 w-full">
				<button class="btn-primary text-light" :disabled="verificationLoading" @click="sendOTP">
					<span v-if="!verificationLoading"> Send OTP to whatsapp </span>
					<Spinner v-else />
				</button>
			</div>
			<div v-else class="grid grid-cols-3 gap-3 w-full">
				<button type="button" class="btn-outline flex-1 w-full" :disabled="verificationLoading" @click="goBack">
					Back
				</button>
				<!-- <button type="button" class="btn-outline" :disabled="verificationLoading" @click="sendOTP">
					Resend
				</button> -->
				<button type="button" class="btn-primary text-light flex-1 w-full" :disabled="verificationLoading" @click="confirmOTP">
					<span v-if="!verificationLoading"> Confirm </span>
					<Spinner v-else />
				</button>
			</div>
		</div>
	</Modal>
</template>

<script setup lang="ts">
import { useLinkWhatsapp } from '@/composables/dashboard/integrations/whatsapp/link'

const { verificationLoading, step, sendOTP, confirmOTP, phoneNumber, otp } = useLinkWhatsapp()

function goBack() {
    // go back to phone input step
    step.value = 1
}

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
