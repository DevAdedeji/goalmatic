import type { User } from 'firebase/auth'
import { useAuthModal } from '../core/modals'
import { afterAuthCheck } from './utils'
import { useUser } from '@/composables/auth/user'
import { googleAuth, signOutUser } from '@/firebase/auth'
import { useAlert } from '@/composables/core/notification'
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

export const authCredentienalsForm = {
		email: ref(''),
    passord: ref(''),
    phone: ref(''),
    loading: ref(false)
	}

export const useSignin = () => {
  const loading = ref(false)
  const router = useRouter()
  const route = useRoute()
  const { trackAuthEvent } = useAnalytics()

  const googleSignin = async (saveRoute = false) => {
    if (saveRoute) useUser().redirectUrl.value = route.fullPath
    loading.value = true
    trackAuthEvent('GOOGLE_AUTH_STARTED')

    try {
      await googleAuth()
      // We redirect to Google; control resumes after redirect.
    } catch (err: any) {
      loading.value = false
      trackAuthEvent('GOOGLE_AUTH_FAILED', {
        error: err.code || err.message
      })
    }
  }

  const signOut = async () => {
    loading.value = true
    try {
      await signOutUser()
      trackAuthEvent('LOGOUT')
      if (location.pathname === '/auth/profile') await router.push('/auth/login')
      useAuthModal().closeLogout()
      location.reload()
      useAlert().openAlert({ type: 'SUCCESS', msg: 'Signed out successfully' })
    } catch (err) {

    } finally {
      loading.value = false
    }
  }

  return {
    googleSignin,
    signOut,
    loading
  }
}
