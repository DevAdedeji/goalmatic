import posthog from 'posthog-js'
import { defineNuxtPlugin } from '#app'

export default defineNuxtPlugin(() => {
  const runtimeConfig = useRuntimeConfig()

  // Initialize PostHog only in production
  let posthogClient: any

  if (import.meta.env.MODE === 'production') {
    // Initialize PostHog in production with cost-conscious configuration
    posthogClient = posthog.init(runtimeConfig.public.posthogPublicKey, {
      api_host: runtimeConfig.public.posthogHost,

      // Cost optimization settings
      autocapture: false, // Disable automatic event capture to control costs
      capture_pageview: false, // Manual pageview capturing below
      capture_pageleave: false, // Manual pageleave capturing below
      session_recording: {
        enabled: false // Disable session recordings to reduce costs
      },
      person_profiles: 'identified_only', // Only create profiles for identified users

      // Performance and privacy settings
      disable_session_recording: true,
      disable_surveys: true,
      disable_toolbar: true,
      respect_dnt: true, // Respect Do Not Track headers

      // Sampling configuration (can be adjusted based on volume)
      sampling: {
        events: 1.0, // 100% for now, can be reduced if volume is high
        session_recordings: 0.0 // 0% session recordings
      },

      // Advanced settings
      cross_subdomain_cookie: false,
      persistence: 'localStorage+cookie',
      cookie_expiration: 365, // 1 year
      upgrade: false, // Disable automatic library upgrades

      // Custom properties to include with all events
      property_blacklist: [
        '$performance_raw',
        '$performance_page_loaded',
        '$performance_navigation',
        '$performance_paint'
      ]
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
      capture: (..._args: any[]) => {
        console.log('[PostHog Mock] Event captured:', _args[0], _args[1])
      },
      identify: (..._args: any[]) => {
        console.log('[PostHog Mock] User identified:', _args[0], _args[1])
      },
      reset: (..._args: any[]) => {
        console.log('[PostHog Mock] Reset called')
      },
      register: (..._args: any[]) => {
        console.log('[PostHog Mock] Properties registered:', _args[0])
      },
      unregister: (..._args: any[]) => {
        console.log('[PostHog Mock] Properties unregistered:', _args[0])
      },
      getFeatureFlag: (..._args: any[]) => {
        console.log('[PostHog Mock] Feature flag requested:', _args[0])
        return undefined
      },
      isFeatureEnabled: (..._args: any[]) => {
        console.log('[PostHog Mock] Feature flag check:', _args[0])
        return false
      },
      reloadFeatureFlags: (..._args: any[]) => {
        console.log('[PostHog Mock] Feature flags reloaded')
      },
      people: {
        set: (..._args: any[]) => {
          console.log('[PostHog Mock] People properties set:', _args[0])
        }
      },
      opt_in_capturing: (..._args: any[]) => {
        console.log('[PostHog Mock] Opted in to capturing')
      },
      opt_out_capturing: (..._args: any[]) => {
        console.log('[PostHog Mock] Opted out of capturing')
      },
      group: (..._args: any[]) => {
        console.log('[PostHog Mock] Group identified:', _args[0], _args[1])
      },
      alias: (..._args: any[]) => {
        console.log('[PostHog Mock] Alias set:', _args[0])
      }
    }
  }

  return {
    provide: {
      posthog: () => posthogClient
    }
  }
})

// Usage example: posthog.capture('my event', { property: 'value' })
