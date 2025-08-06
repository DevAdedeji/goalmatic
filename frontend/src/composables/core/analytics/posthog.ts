import { useNuxtApp } from '#app'
import { useUser } from '@/composables/auth/user'

// Event naming conventions
export const ANALYTICS_EVENTS = {
  // Authentication events
  AUTH: {
    LOGIN_STARTED: 'auth_login_started',
    LOGIN_SUCCESS: 'auth_login_success',
    LOGIN_FAILED: 'auth_login_failed',
    SIGNUP_STARTED: 'auth_signup_started',
    SIGNUP_SUCCESS: 'auth_signup_success',
    SIGNUP_FAILED: 'auth_signup_failed',
    LOGOUT: 'auth_logout',
    GOOGLE_AUTH_STARTED: 'auth_google_started',
    GOOGLE_AUTH_SUCCESS: 'auth_google_success',
    GOOGLE_AUTH_FAILED: 'auth_google_failed',
    PHONE_OTP_SENT: 'auth_phone_otp_sent',
    PHONE_OTP_VERIFIED: 'auth_phone_otp_verified',
    EMAIL_VERIFICATION_SENT: 'auth_email_verification_sent',
    EMAIL_VERIFIED: 'auth_email_verified'
  },

  // Flow management events
  FLOW: {
    CREATED: 'flow_created',
    UPDATED: 'flow_updated',
    DELETED: 'flow_deleted',
    ACTIVATED: 'flow_activated',
    DEACTIVATED: 'flow_deactivated',
    EXECUTED: 'flow_executed',
    EXECUTION_FAILED: 'flow_execution_failed',
    CLONED: 'flow_cloned',
    SHARED: 'flow_shared',
    IMPORTED: 'flow_imported'
  },

  // Node configuration events
  NODE: {
    ADDED: 'node_added',
    REMOVED: 'node_removed',
    CONFIGURED: 'node_configured',
    TESTED: 'node_tested',
    TEST_SUCCESS: 'node_test_success',
    TEST_FAILED: 'node_test_failed',
    CONNECTED: 'node_connected',
    DISCONNECTED: 'node_disconnected'
  },

  // Job scraping events
  JOB_SCRAPER: {
    SEARCH_STARTED: 'job_scraper_search_started',
    SEARCH_SUCCESS: 'job_scraper_search_success',
    SEARCH_FAILED: 'job_scraper_search_failed',
    JOBS_FOUND: 'job_scraper_jobs_found',
    SITE_SELECTED: 'job_scraper_site_selected'
  },

  // Email trigger events
  EMAIL_TRIGGER: {
    CREATED: 'email_trigger_created',
    ACTIVATED: 'email_trigger_activated',
    EMAIL_RECEIVED: 'email_trigger_email_received',
    FLOW_TRIGGERED: 'email_trigger_flow_triggered',
    FILTER_APPLIED: 'email_trigger_filter_applied'
  },

  // Table operations
  TABLE: {
    CREATED: 'table_created',
    RECORD_ADDED: 'table_record_added',
    RECORD_UPDATED: 'table_record_updated',
    RECORD_DELETED: 'table_record_deleted',
    CLONED: 'table_cloned',
    EXPORTED: 'table_exported'
  },

  // Agent interactions
  AGENT: {
    MESSAGE_SENT: 'agent_message_sent',
    RESPONSE_RECEIVED: 'agent_response_received',
    CONVERSATION_STARTED: 'agent_conversation_started',
    CONVERSATION_ENDED: 'agent_conversation_ended'
  },

  // UI interactions
  UI: {
    PAGE_VIEW: 'page_view',
    BUTTON_CLICK: 'button_click',
    MODAL_OPENED: 'modal_opened',
    MODAL_CLOSED: 'modal_closed',
    TAB_SWITCHED: 'tab_switched',
    SEARCH_PERFORMED: 'search_performed'
  },

  // Business events
  BUSINESS: {
    SUBSCRIPTION_STARTED: 'subscription_started',
    SUBSCRIPTION_CANCELLED: 'subscription_cancelled',
    PAYMENT_SUCCESS: 'payment_success',
    PAYMENT_FAILED: 'payment_failed',
    TRIAL_STARTED: 'trial_started',
    TRIAL_ENDED: 'trial_ended'
  }
} as const

// Type for event properties
export interface AnalyticsEventProperties {
  [key: string]: string | number | boolean | null | undefined
}

// Enhanced analytics service
export const useAnalytics = () => {
  const nuxtApp = useNuxtApp()
  const { id: userId, user } = useUser()

  // Get PostHog instance
  const getPostHog = () => {
    try {
      return nuxtApp.$posthog?.()
    } catch (error) {
      console.warn('[Analytics] PostHog not available:', error)
      return null
    }
  }

  // Identify user with PostHog
  const identifyUser = (userProperties?: AnalyticsEventProperties) => {
    const posthog = getPostHog()
    if (!posthog || !userId.value) return

    const userData = user.value
    const properties = {
      email: userData?.email,
      name: userData?.displayName || userData?.name,
      email_verified: userData?.emailVerified,
      provider: userData?.providerData?.[0]?.providerId,
      created_at: userData?.metadata?.creationTime,
      last_sign_in: userData?.metadata?.lastSignInTime,
      ...userProperties
    }

    posthog.identify(userId.value, properties)
  }

  // Track event with standardized properties
  const trackEvent = (
    eventName: string, 
    properties?: AnalyticsEventProperties,
    options?: {
      skipUserIdentification?: boolean
    }
  ) => {
    const posthog = getPostHog()
    if (!posthog) return

    // Identify user if not skipped and user is available
    if (!options?.skipUserIdentification && userId.value) {
      identifyUser()
    }

    // Add standard properties
    const standardProperties = {
      timestamp: new Date().toISOString(),
      user_id: userId.value,
      environment: import.meta.env.MODE,
      ...properties
    }

    posthog.capture(eventName, standardProperties)
  }

  // Convenience methods for common events
  const trackPageView = (pagePath: string, pageTitle?: string) => {
    trackEvent(ANALYTICS_EVENTS.UI.PAGE_VIEW, {
      page_path: pagePath,
      page_title: pageTitle || 'Untitled Page'
    })
  }

  const trackButtonClick = (buttonLabel: string, location?: string) => {
    trackEvent(ANALYTICS_EVENTS.UI.BUTTON_CLICK, {
      button_label: buttonLabel,
      location: location
    })
  }

  const trackModalInteraction = (modalName: string, action: 'opened' | 'closed') => {
    const eventName = action === 'opened' 
      ? ANALYTICS_EVENTS.UI.MODAL_OPENED 
      : ANALYTICS_EVENTS.UI.MODAL_CLOSED
    
    trackEvent(eventName, {
      modal_name: modalName
    })
  }

  // Flow-specific tracking methods
  const trackFlowEvent = (action: keyof typeof ANALYTICS_EVENTS.FLOW, flowId: string, properties?: AnalyticsEventProperties) => {
    trackEvent(ANALYTICS_EVENTS.FLOW[action], {
      flow_id: flowId,
      ...properties
    })
  }

  const trackNodeEvent = (action: keyof typeof ANALYTICS_EVENTS.NODE, nodeType: string, properties?: AnalyticsEventProperties) => {
    trackEvent(ANALYTICS_EVENTS.NODE[action], {
      node_type: nodeType,
      ...properties
    })
  }

  const trackJobScrapingEvent = (action: keyof typeof ANALYTICS_EVENTS.JOB_SCRAPER, properties?: AnalyticsEventProperties) => {
    trackEvent(ANALYTICS_EVENTS.JOB_SCRAPER[action], properties)
  }

  const trackAuthEvent = (action: keyof typeof ANALYTICS_EVENTS.AUTH, properties?: AnalyticsEventProperties) => {
    trackEvent(ANALYTICS_EVENTS.AUTH[action], properties)
  }

  // Reset user data (for logout)
  const resetUser = () => {
    const posthog = getPostHog()
    if (!posthog) return

    posthog.reset()
  }

  // Set user properties
  const setUserProperties = (properties: AnalyticsEventProperties) => {
    const posthog = getPostHog()
    if (!posthog || !userId.value) return

    posthog.people.set(properties)
  }

  // Group tracking (for organizations/teams)
  const identifyGroup = (groupType: string, groupKey: string, groupProperties?: AnalyticsEventProperties) => {
    const posthog = getPostHog()
    if (!posthog) return

    posthog.group(groupType, groupKey, groupProperties)
  }

  return {
    // Core methods
    trackEvent,
    identifyUser,
    resetUser,
    setUserProperties,
    identifyGroup,

    // Convenience methods
    trackPageView,
    trackButtonClick,
    trackModalInteraction,

    // Domain-specific methods
    trackFlowEvent,
    trackNodeEvent,
    trackJobScrapingEvent,
    trackAuthEvent,

    // Constants
    EVENTS: ANALYTICS_EVENTS
  }
}

// Global composable for tracking events
export const useTrackEvent = (eventName: string, properties?: AnalyticsEventProperties) => {
  const { trackEvent } = useAnalytics()
  trackEvent(eventName, properties)
}
