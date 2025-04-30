import posthog from 'posthog-js'
import { defineNuxtPlugin } from '#app'

export default defineNuxtPlugin(() => {
  const runtimeConfig = useRuntimeConfig()

  // Initialize PostHog only in production
  let posthogClient: any

  if (import.meta.env.MODE === 'production') {
    // Initialize PostHog in production
    posthogClient = posthog.init(runtimeConfig.public.posthogPublicKey, {
      api_host: runtimeConfig.public.posthogHost,
      person_profiles: 'always', // Create profiles for anonymous users as well
      capture_pageview: false // We add manual pageview capturing below
    })

    // Make sure that pageviews are captured with each route change
    const router = useRouter()
    router.afterEach((to) => {
      nextTick(() => {
        posthogClient.capture('$pageview', {
          current_url: to.fullPath
        })
      })
    })

    // Add event listener for page leave events
    if (process.client) {
      // Track when user leaves the page
      window.addEventListener('beforeunload', () => {
        posthogClient.capture('$pageleave')
      })

      // Alternative approach using the visibility API for more accurate tracking
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'hidden') {
          posthogClient.capture('$pageleave')
        }
      })
    }
  } else {
    // Create a mock PostHog client for non-production environments
    posthogClient = {
      capture: (..._args: any[]) => undefined,
      identify: (..._args: any[]) => undefined,
      reset: (..._args: any[]) => undefined,
      register: (..._args: any[]) => undefined,
      unregister: (..._args: any[]) => undefined,
      getFeatureFlag: (..._args: any[]) => undefined,
      isFeatureEnabled: (..._args: any[]) => false,
      reloadFeatureFlags: (..._args: any[]) => undefined,
      people: {
        set: (..._args: any[]) => undefined
      },
      opt_in_capturing: (..._args: any[]) => undefined,
      opt_out_capturing: (..._args: any[]) => undefined
    }
  }

  return {
    provide: {
      posthog: () => posthogClient
    }
  }
})

// Usage example: posthog.capture('my event', { property: 'value' })
