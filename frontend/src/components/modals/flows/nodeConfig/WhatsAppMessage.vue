<template>
	<div>
		<div class="mb-4">
			<label class="block font-medium mb-1">Message</label>
			<textarea v-model="form.message" class="input-field w-full" rows="3" placeholder="Enter WhatsApp message" />
		</div>
		<div class="mb-4">
			<label class="block font-medium mb-1">Recipient Type</label>
			<select v-model="form.recipientType" class="input-field w-full">
				<option value="user">
					User's WhatsApp
				</option>
				<option value="custom">
					Custom Phone Number
				</option>
			</select>
		</div>
		<div class="mb-4">
			<label class="block font-medium mb-1">Phone Number</label>
			<PhoneInput v-model="form.phoneNumber" :disabled="form.recipientType === 'user'" placeholder="e.g. +1234567890" @input="resetVerification" />

			<div v-if="form.recipientType === 'custom'">
				<button v-if="!verified" type="button" class="btn-primary mt-2" :disabled="loading || verified || form.phoneNumber.length < 10" @click="openOtpModal">
					Verify Phone
				</button>
				<span v-if="verified" class="text-green-600 ml-2">Verified &#10003;</span>
			</div>
		</div>
		<div class="flex gap-2 mt-6">
			<button class="btn-primary flex-1" :disabled="!canSave" @click="save">
				Save
			</button>
			<button class="btn-secondary flex-1" @click="$emit('cancel')">
				Cancel
			</button>
		</div>
	</div>
</template>

<script setup lang="ts">
import { ref, watch, computed, onMounted } from 'vue'
import { useUser } from '@/composables/auth/user'
import { useCoreModal } from '@/composables/core/modals'
import { getSingleFirestoreDocument } from '@/firebase/firestore/fetch'


const props = defineProps({
	payload: Object,
	nodeProps: Array,
	formValues: Object,
	hasProps: Boolean,
	loading: Boolean
})

const emit = defineEmits(['save', 'cancel'])

const form = ref({
	message: '',
	recipientType: 'user',
	phoneNumber: '8146923944'
})
const verified = ref(false)
const user = useUser()

// Prepopulate from formValues if editing
onMounted(async () => {
	if (props.formValues) {
    form.value = { ...form.value, ...props.formValues }
	}
	if (form.value.recipientType === 'user') {
		await prepopulateUserPhone()
	}
})

watch(() => form.value.recipientType, async (val) => {
	if (val === 'user') {
		await prepopulateUserPhone()
		verified.value = true
	} else {
		verified.value = false
	}
})

async function prepopulateUserPhone() {
	// Fetch WhatsApp integration for user
	const userId = user.id.value
	if (!userId) return
	const userRef = ref()
	await getSingleFirestoreDocument('users', userId, userRef)
	// Find WhatsApp integration
	let phone = ''
	if (userRef.value && userRef.value.integrations) {
		const wa = Object.values(userRef.value.integrations).find((i: any) => i.provider === 'WHATSAPP')
		if (wa && typeof wa === 'object' && 'phone' in wa) phone = wa.phone as string
	}
	form.value.phoneNumber = phone || ''
}

function resetVerification() {
	if (form.value.recipientType === 'custom') {
		verified.value = false
	}
}

function openOtpModal() {
	useCoreModal().openOtpVerificationModal({
		phoneNumber: form.value.phoneNumber,
		onVerified: () => {
      verified.value = true
      useCoreModal().closeOtpVerificationModal()
		}
	})
}

function handleOtpVerified() {
	verified.value = true
}

const canSave = computed(() => {
	if (!form.value.message) return false
	if (form.value.recipientType === 'custom') {
		return !!form.value.phoneNumber && verified.value
	}
	if (form.value.recipientType === 'user') {
		return !!form.value.phoneNumber
	}
	return false
})

function save() {
	emit('save', {
		message: form.value.message,
		recipientType: form.value.recipientType,
		phoneNumber: form.value.phoneNumber
	})
}
</script>

<style scoped>

</style>


