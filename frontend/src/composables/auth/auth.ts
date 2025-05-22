import type { User } from 'firebase/auth'
import { useAuthModal } from '../core/modals'
import { afterAuthCheck } from './utils'
import { useUser } from '@/composables/auth/user'
import { googleAuth, signOutUser } from '@/firebase/auth'
import { useAlert } from '@/composables/core/notification'

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

  const googleSignin = async (saveRoute = false) => {
    if (saveRoute) useUser().redirectUrl.value = route.fullPath
    loading.value = true
    try {
      const user = await googleAuth() as User
      await useUser().setUser(user)

      // Only track signUp if this is a new user
      if (user.metadata && user.metadata.creationTime === user.metadata.lastSignInTime) {
        try {
          if (typeof window !== 'undefined' && window.ahaTracker) {
            window.ahaTracker.track([{ name: 'signUp' }])
          }
        } catch (error) {
          console.error(error)
        }
      }

      await afterAuthCheck(user)

      loading.value = false
    } catch (err) {
      loading.value = false
    }
  }

  const signOut = async () => {
    loading.value = true
    try {
      await signOutUser()
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
