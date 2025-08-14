import { Timestamp } from 'firebase/firestore'
import { signInWithCustomToken } from 'firebase/auth'
import { authCredentienalsForm } from './auth'
import { afterAuthCheck } from './utils'
import { useAlert } from '@/composables/core/notification'
import { callFirebaseFunction } from '@/firebase/functions'
import { useUser } from '@/composables/auth/user'
import { auth } from '@/firebase/init'
import { useAnalytics } from '@/composables/core/analytics/posthog'

export const useWhatsAppAuth = () => {
    const step = ref(1)
    const otp = ref(['', '', '', ''])
    const { trackAuthEvent } = useAnalytics()

    const sendOTP = async (isSignup = true) => {
        if (!validatePhoneNumber(authCredentienalsForm.phone.value)) {
            useAlert().openAlert({ type: 'ERROR', msg: 'Invalid phone number' })
            return
        }

        authCredentienalsForm.loading.value = true
        trackAuthEvent('PHONE_OTP_SENT', {
            method: 'whatsapp',
            is_signup: isSignup
        })

        try {
            const functionName = isSignup ? 'sendWhatsappOTPForSignup' : 'sendWhatsappOTPForLogin'
            const res = await callFirebaseFunction(functionName, {
                phoneNumber: authCredentienalsForm.phone.value
            }) as any

            if (res.code === 200) {
                step.value = 2
                useAlert().openAlert({ type: 'SUCCESS', msg: res?.message || 'OTP sent to WhatsApp' })
            } else {
                useAlert().openAlert({ type: 'ERROR', msg: res?.message || 'Failed to send OTP', addrs: 'useWhatsAppAuth' })
            }
        } catch (error: any) {
            useAlert().openAlert({ type: 'ERROR', msg: error.message || 'Failed to send OTP', addrs: 'useWhatsAppAuth catch' })
        } finally {
            authCredentienalsForm.loading.value = false
        }
    }

    const confirmOTP = async (fullName?: string) => {
        authCredentienalsForm.loading.value = true
        try {
            const otpCode = otp.value.join('')

            // Get referral code from localStorage if available
            let referralCode: string | null = null
            if (process.client) {
                referralCode = localStorage.getItem('signup_referral_code')
            }

            const res = await callFirebaseFunction('verifyWhatsappOTPAndCreateAccount', {
                phoneNumber: authCredentienalsForm.phone.value,
                otp: otpCode,
                fullName,
                referralCode
            }) as any

            if (res.code === 200) {
                // Sign in with custom token from backend
                const credential = await signInWithCustomToken(auth, res.customToken)
                const user = credential.user

                await useUser().setUser(user as any)
                await afterAuthCheck(user as any)

                useAlert().openAlert({ type: 'SUCCESS', msg: 'Account created successfully!' })

                // Clean up referral code from localStorage
                if (process.client && referralCode) {
                    localStorage.removeItem('signup_referral_code')
                }

                // Track signup
                try {
                    if (typeof window !== 'undefined' && window.ahaTracker) {
                        window.ahaTracker.track([{ name: 'signUp' }])
                    }
                } catch (error) {
                    console.error(error)
                }
            } else {
                useAlert().openAlert({ type: 'ERROR', msg: res?.message || 'Invalid OTP' })
            }
        } catch (error: any) {
            useAlert().openAlert({ type: 'ERROR', msg: error.message || 'Failed to verify OTP' })
        } finally {
            authCredentienalsForm.loading.value = false
        }
    }

    const loginWithOTP = async () => {
        authCredentienalsForm.loading.value = true
        try {
            const otpCode = otp.value.join('')

            const res = await callFirebaseFunction('verifyWhatsappOTPAndLogin', {
                phoneNumber: authCredentienalsForm.phone.value,
                otp: otpCode
            }) as any

            if (res.code === 200) {
                // Sign in with custom token from backend
                const credential = await signInWithCustomToken(auth, res.customToken)
                const user = credential.user

                await useUser().setUser(user as any)
                await afterAuthCheck(user as any)

                useAlert().openAlert({ type: 'SUCCESS', msg: 'Logged in successfully!' })
            } else {
                useAlert().openAlert({ type: 'ERROR', msg: res?.message || 'Invalid OTP' })
            }
        } catch (error: any) {
            useAlert().openAlert({ type: 'ERROR', msg: error.message || 'Failed to verify OTP' })
        } finally {
            authCredentienalsForm.loading.value = false
        }
    }

    const reset = () => {
        step.value = 1
        otp.value = ['', '', '', '']
    }

    const sendSignupOTP = () => sendOTP(true)
    const sendLoginOTP = () => sendOTP(false)

    return {
        sendOTP,
        sendSignupOTP,
        sendLoginOTP,
        confirmOTP,
        loginWithOTP,
        step,
        otp,
        reset
    }
}

const validatePhoneNumber = (phone: string): boolean => {
    // Basic validation for length and digits
    if (!phone || phone.length < 10) {
        return false
    }
    return true
}
