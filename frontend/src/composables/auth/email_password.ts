import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth'
import { authCredentienalsForm } from './auth'
import { afterAuthCheck } from './utils'
import { useUser } from '@/composables/auth/user'
import { authRef } from '@/firebase/auth'
import { useAlert } from '@/composables/core/notification'
import { firebaseErrorMessage } from '@/firebase/utils'
import { useAnalytics } from '@/composables/core/analytics/posthog'

declare global {
  interface Window {
    ahaTracker?: {
      track: (events: Array<{ name: string }>) => void
      ready?: boolean
      payload?: {
        orderId?: string
        campaignId?: string
        clientId?: string
      }
    }
  }
}

export const useEmailAndPassword = () => {
    const router = useRouter()
    const { trackAuthEvent } = useAnalytics()

 const signIn = async () => {
    authCredentienalsForm.loading.value = true
    trackAuthEvent('LOGIN_STARTED', { method: 'email' })

    try {
        const userCredential = await signInWithEmailAndPassword(authRef, authCredentienalsForm.email.value, authCredentienalsForm.passord.value)
        await useUser().setUser(userCredential.user)
        await afterAuthCheck(userCredential.user)

        trackAuthEvent('LOGIN_SUCCESS', {
          method: 'email',
          user_id: userCredential.user.uid
        })
        authCredentienalsForm.loading.value = false
    } catch (err: any) {
      authCredentienalsForm.loading.value = false
      trackAuthEvent('LOGIN_FAILED', {
        method: 'email',
        error: err.code || err.message
      })
      useAlert().openAlert({ type: 'ERROR', msg: firebaseErrorMessage(err) })
    }
 }

 const signUp = async () => {
    authCredentienalsForm.loading.value = true
    trackAuthEvent('SIGNUP_STARTED', { method: 'email' })

    try {
        const userCredential = await createUserWithEmailAndPassword(authRef, authCredentienalsForm.email.value, authCredentienalsForm.passord.value)

        await useUser().setUser(userCredential.user)
        await afterAuthCheck(userCredential.user)

        trackAuthEvent('SIGNUP_SUCCESS', {
          method: 'email',
          user_id: userCredential.user.uid
        })
        authCredentienalsForm.loading.value = false
    } catch (err: any) {
      authCredentienalsForm.loading.value = false
      trackAuthEvent('SIGNUP_FAILED', {
        method: 'email',
        error: err.code || err.message
      })
      useAlert().openAlert({ type: 'ERROR', msg: firebaseErrorMessage(err) })
    } finally {
        try {
            if (typeof window !== 'undefined' && window.ahaTracker) {
                window.ahaTracker.track([{ name: 'signUp' }])
            }
        } catch (error) {
            console.error(error)
        }
    }
 }


    return { signIn, signUp }
}
