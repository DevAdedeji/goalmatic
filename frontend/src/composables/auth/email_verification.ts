import { sendEmailVerification, reload } from 'firebase/auth'
import type { User } from 'firebase/auth'
import { useUser } from './user'
import { afterAuthCheck } from './utils'
import { authRef } from '@/firebase/auth'
import { useAlert } from '@/composables/core/notification'
import { firebaseErrorMessage } from '@/firebase/utils'

export const useEmailVerification = () => {
    const { user } = useUser()
    const loading = ref(false)
    const resendLoading = ref(false)

    // Check if the user's email is verified
    const isEmailVerified = computed(() => {
        return user.value?.emailVerified || false
    })

    // Send email verification
    const sendVerificationEmail = async () => {
        if (!user.value) {
            useAlert().openAlert({ type: 'ERROR', msg: 'User not found' })
            return
        }

        resendLoading.value = true
        try {
            await sendEmailVerification(authRef.currentUser as User)
            useAlert().openAlert({
                type: 'SUCCESS',
                msg: 'Verification email sent! Please check your inbox and spam folder.'
            })
        } catch (error: any) {
            useAlert().openAlert({
                type: 'ERROR',
                msg: firebaseErrorMessage(error)
            })
        } finally {
            resendLoading.value = false
        }
    }

    // Check email verification status
    const checkVerificationStatus = async () => {
        if (!authRef.currentUser) return false

        loading.value = true
        try {
            await reload(authRef.currentUser as User)
            if (authRef.currentUser?.emailVerified) {
                await useUser().setUser(authRef.currentUser as User)
                await afterAuthCheck(authRef.currentUser)
            }
            return authRef.currentUser?.emailVerified || false
        } catch (error: any) {
            console.error('Error checking verification status:', error)
            return false
        } finally {
            loading.value = false
        }
    }

    return {
        isEmailVerified,
        sendVerificationEmail,
        checkVerificationStatus,
        loading,
        resendLoading
    }
}
