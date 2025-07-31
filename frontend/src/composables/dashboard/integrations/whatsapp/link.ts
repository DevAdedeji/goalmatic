import { v4 as uuidv4 } from 'uuid'
import { Timestamp } from 'firebase/firestore'
import { useUser } from '@/composables/auth/user'
import { useAlert } from '@/composables/core/notification'
import { callFirebaseFunction } from '@/firebase/functions'
import { getSingleFirestoreDocument } from '@/firebase/firestore/fetch'
import { setFirestoreSubDocument } from '@/firebase/firestore/create'
import { useIntegrationsModal } from '@/composables/core/modals'

const loading = ref(false)
const step = ref(1)
const phoneNumber = ref('')
const otp = ref([])
const verificationLoading = ref(false)

export const useLinkWhatsapp = () => {
    const { id: user_id } = useUser()


    const link = async () => {
        useIntegrationsModal().openConnectWhatsapp()
    }

    const sendOTP = async () => {
        if (!validatePhoneNumber(phoneNumber.value)) {
            useAlert().openAlert({ type: 'ERROR', msg: 'Invalid phone number' })
            return
        }
        verificationLoading.value = true
        const res = await callFirebaseFunction('sendWhatsappOTP', { phoneNumber: phoneNumber.value }) as any
        if (res.code === 200) {
            step.value = 2
            useAlert().openAlert({ type: 'SUCCESS', msg: res?.msg || 'OTP sent to whatsapp' })
        } else {
            useAlert().openAlert({ type: 'ERROR', msg: res?.msg || 'Failed to send OTP' })
        }
        verificationLoading.value = false
    }

    const confirmOTP = async () => {
        if (import.meta.server) return
        const otpCode = otp.value.join('')
        const userRef = ref()
        await getSingleFirestoreDocument('users', user_id.value!, userRef)
        const sentOTP = userRef.value?.otp
        if (otpCode !== sentOTP) {
            useAlert().openAlert({ type: 'ERROR', msg: 'Invalid OTP' })
            return
        }

        const id = uuidv4()
        setFirestoreSubDocument('users', user_id.value!, 'integrations', id, {
            id,
            type: 'MESSAGING',
            provider: 'WHATSAPP',
            phone: phoneNumber.value, // Keep normalized format (with +)
            created_at: Timestamp.fromDate(new Date()),
            updated_at: Timestamp.fromDate(new Date()),
            integration_id: 'WHATSAPP',
            user_id: user_id.value!
        })

        useIntegrationsModal().closeConnectWhatsapp()
        useAlert().openAlert({ type: 'SUCCESS', msg: 'Whatsapp connected successfully' })
    }

    return { loading, verificationLoading, link, sendOTP, confirmOTP, step, phoneNumber, otp }
}

const validatePhoneNumber = (phone: string): boolean => {
    // Basic validation for length and digits
    if (phone.length < 10) {
        return false
    }
    return true
}
