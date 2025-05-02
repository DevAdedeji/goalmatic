// utils/analytics.ts
import { ref } from 'vue'
import { useUser } from '@/composables/auth/user'
import { useNuxtApp } from '#app'

let initialized = false

export const GA_ID = import.meta.env.VITE_GA_ID as string

declare global{
    interface Window {
        dataLayer: any[]
        gtag: (...args: any[]) => void
    }
}

export const initializeAnalytics = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (initialized) {
      resolve()
      return
    }

    if (process.client) {
      const script = document.createElement('script')
      script.async = true
      script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`
      document.head.appendChild(script)

      script.onload = () => {
        window.dataLayer = window.dataLayer || []
        function gtag(...args: any[]) { window.dataLayer.push(args) }
        window.gtag = gtag
        gtag('js', new Date())
        gtag('config', GA_ID)

        initialized = true
        resolve()
      }

      script.onerror = () => {
        reject(new Error('Failed to load GA4 script'))
      }
    } else {
      resolve()
    }
  })
}

export const useFireEvents = () => {
  const billingEnabled = ref(import.meta.env.MODE === 'production')
  const nuxtApp = useNuxtApp()
  const { id, user } = useUser()

  const fireEvent = (name: string, props?: any) => {
    if (!billingEnabled.value) {
      return
    }

    // Use PostHog if available
    try {
      const posthog = nuxtApp.$posthog?.()
      if (posthog && id.value) {
        const userData = user.value
        posthog.identify(id.value, {
          email: userData?.email,
          name: userData?.displayName
        })
        posthog.capture(name, props)
      }
    } catch (error) {
      console.error('PostHog error:', error)
    }

    // Use Plausible if available
    // Note: Plausible is mentioned in the privacy policy but not currently implemented
    // This is a placeholder for future implementation
    try {
      // If Plausible is implemented in the future, uncomment this code
      // const plausible = nuxtApp.$plausible
      // if (plausible && typeof plausible === 'function') {
      //   plausible(name, { props })
      // }
    } catch (error) {
      console.error('Plausible error:', error)
    }
  }

  return fireEvent
}
