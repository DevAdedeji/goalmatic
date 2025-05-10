<template>
	<Modal
		modal="$atts.modal"
		:props-modal="propsModal"
		:auto-close="false"
		title="Verify Phone Number"
	>
		<form class="auth-form mt-4 p-1" @submit.prevent="step === 1 ? sendOTP() : confirmOTP()">
			<div v-if="step === 1" class="field relative">
				<label>Phone Number</label>
				<input v-model="phoneNumberLocal" class="input-field w-full" disabled>
			</div>
			<div v-if="step === 2" class="w-auto mr-auto">
				<OTPInput v-model="otp" :length="4" container-class="md:w-80 w-60" />
			</div>
			<div class="grid grid-cols-1 gap-4 mt-6 w-full ">
				<button class="btn-primary text-light" :disabled="loading">
					<span v-if="!loading">{{ step === 1 ? 'Send OTP to WhatsApp' : 'Verify OTP' }}</span>
					<span v-else>Loading...</span>
				</button>
			</div>
		</form>
	</Modal>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import { useAlert } from '@/composables/core/notification'
import { callFirebaseFunction } from '@/firebase/functions'
import { getSingleFirestoreDocument } from '@/firebase/firestore/fetch'
import { useUser } from '@/composables/auth/user'

const props = defineProps({
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
const emit = defineEmits(['verified', 'close'])

const loading = ref(false)
const step = ref(1)
const otp = ref(['', '', '', ''])
const phoneNumberLocal = ref('')
const user = useUser()

watch(() => props.payload?.phoneNumber, (val) => {
  phoneNumberLocal.value = val || ''
})
onMounted(() => {
  phoneNumberLocal.value = props.payload?.phoneNumber || ''
  if (step.value === 1 && phoneNumberLocal.value) {
    sendOTP()
  }
})

function close() {
  emit('close')
  step.value = 1
  otp.value = ['', '', '', '']
}

function validatePhoneNumber(phone: string | number): boolean {
  console.log(phone)
  return phone.toString().replace(/\D/g, '').length >= 10
}

async function sendOTP() {
  if (!validatePhoneNumber(phoneNumberLocal.value)) {
    useAlert().openAlert({ type: 'ERROR', msg: 'Invalid phone number' })
    return
  }
  loading.value = true
  try {
    const res = await callFirebaseFunction('sendWhatsappOTP', { phoneNumber: phoneNumberLocal.value }) as any
    if (res.code === 200) {
      step.value = 2
      useAlert().openAlert({ type: 'SUCCESS', msg: res?.msg || 'OTP sent to WhatsApp' })
    } else {
      useAlert().openAlert({ type: 'ERROR', msg: res?.msg || 'Failed to send OTP' })
    }
  } finally {
    loading.value = false
  }
}

async function confirmOTP() {
  loading.value = true
  try {
    const userId = user.id.value
    if (!userId) {
      useAlert().openAlert({ type: 'ERROR', msg: 'User not found' })
      return
    }
    const userRef = ref()
    await getSingleFirestoreDocument('users', userId, userRef)
    const sentOTP = userRef.value?.otp
    if (otp.value.join('') !== sentOTP) {
      useAlert().openAlert({ type: 'ERROR', msg: 'Invalid OTP' })
      return
    }
    useAlert().openAlert({ type: 'SUCCESS', msg: 'Phone number verified!' })
    props.payload?.onVerified()
    emit('verified')
    close()
  } finally {
    loading.value = false
  }
}
</script>

