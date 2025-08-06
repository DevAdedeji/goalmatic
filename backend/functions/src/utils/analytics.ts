import { PostHog } from 'posthog-node'
import { is_dev } from '../init'

// PostHog client instance
let posthogClient: PostHog | null = null

// Initialize PostHog client with cost-conscious configuration
const initializePostHog = (): PostHog | null => {
  if (posthogClient) {
    return posthogClient
  }

  const posthogKey = process.env.POSTHOG_API_KEY
  const posthogHost = process.env.POSTHOG_HOST || 'https://us.i.posthog.com'

  if (!posthogKey) {
    console.warn('[Analytics] PostHog API key not configured')
    return null
  }

  try {
    posthogClient = new PostHog(posthogKey, {
      host: posthogHost,
      // Cost optimization settings
      flushAt: 20, // Batch events before sending
      flushInterval: 10000, // Send batches every 10 seconds
      personalApiKey: undefined, // Don't use personal API key
      featureFlagsPollingInterval: 300000, // Poll feature flags every 5 minutes
      requestTimeout: 3000, // 3 second timeout
      // Disable in development to avoid test data
      disabled: is_dev
    })

    console.log('[Analytics] PostHog initialized successfully')
    return posthogClient
  } catch (error) {
    console.error('[Analytics] Failed to initialize PostHog:', error)
    return null
  }
}

// Event naming conventions for backend
export const BACKEND_ANALYTICS_EVENTS = {
  // WhatsApp events
  WHATSAPP: {
    MESSAGE_RECEIVED: 'whatsapp_message_received',
    MESSAGE_SENT: 'whatsapp_message_sent',
    OTP_SENT: 'whatsapp_otp_sent',
    OTP_VERIFIED: 'whatsapp_otp_verified',
    SIGNUP_FLOW_STARTED: 'whatsapp_signup_flow_started',
    SIGNUP_COMPLETED: 'whatsapp_signup_completed',
    COMMAND_EXECUTED: 'whatsapp_command_executed',
    UNSUPPORTED_MESSAGE: 'whatsapp_unsupported_message',
    BUTTON_CLICKED: 'whatsapp_button_clicked'
  },

  // Flow execution events
  FLOW: {
    ACTIVATED: 'flow_activated',
    DEACTIVATED: 'flow_deactivated',
    EXECUTION_STARTED: 'flow_execution_started',
    EXECUTION_COMPLETED: 'flow_execution_completed',
    EXECUTION_FAILED: 'flow_execution_failed',
    STEP_EXECUTED: 'flow_step_executed',
    STEP_FAILED: 'flow_step_failed'
  },

  // Email trigger events
  EMAIL_TRIGGER: {
    CREATED: 'email_trigger_created',
    ACTIVATED: 'email_trigger_activated',
    EMAIL_RECEIVED: 'email_trigger_email_received',
    EMAIL_PROCESSED: 'email_trigger_email_processed',
    EMAIL_FILTERED: 'email_trigger_email_filtered',
    FLOW_TRIGGERED: 'email_trigger_flow_triggered'
  },

  // Job scraping events
  JOB_SCRAPER: {
    SCRAPE_STARTED: 'job_scraper_scrape_started',
    SCRAPE_COMPLETED: 'job_scraper_scrape_completed',
    SCRAPE_FAILED: 'job_scraper_scrape_failed',
    JOBS_FOUND: 'job_scraper_jobs_found',
    API_CALLED: 'job_scraper_api_called'
  },

  // Authentication events
  AUTH: {
    ACCOUNT_CREATED: 'auth_account_created',
    LOGIN_SUCCESS: 'auth_login_success',
    OTP_GENERATION: 'auth_otp_generation',
    OTP_VERIFICATION: 'auth_otp_verification'
  },

  // Agent interactions
  AGENT: {
    MESSAGE_PROCESSED: 'agent_message_processed',
    RESPONSE_GENERATED: 'agent_response_generated',
    TOOL_CALLED: 'agent_tool_called',
    ERROR_OCCURRED: 'agent_error_occurred'
  },

  // Table operations
  TABLE: {
    RECORD_CREATED: 'table_record_created',
    RECORD_UPDATED: 'table_record_updated',
    RECORD_DELETED: 'table_record_deleted',
    TABLE_CLONED: 'table_cloned'
  },

  // System events
  SYSTEM: {
    FUNCTION_CALLED: 'system_function_called',
    ERROR_OCCURRED: 'system_error_occurred',
    PERFORMANCE_METRIC: 'system_performance_metric'
  }
} as const

// Type for event properties
export interface BackendAnalyticsEventProperties {
  [key: string]: string | number | boolean | null | undefined
}

// Analytics service for backend
export class BackendAnalytics {
  private posthog: PostHog | null

  constructor() {
    this.posthog = initializePostHog()
  }

  // Track event with standardized properties
  trackEvent(
    eventName: string,
    properties?: BackendAnalyticsEventProperties,
    userId?: string
  ): void {
    if (!this.posthog) {
      console.log('[Analytics] Event would be tracked:', eventName, properties)
      return
    }

    try {
      const standardProperties = {
        timestamp: new Date().toISOString(),
        environment: is_dev ? 'development' : 'production',
        source: 'backend',
        ...properties
      }

      if (userId) {
        this.posthog.capture({
          distinctId: userId,
          event: eventName,
          properties: standardProperties
        })
      } else {
        // Use a system identifier for events without user context
        this.posthog.capture({
          distinctId: 'system',
          event: eventName,
          properties: standardProperties
        })
      }
    } catch (error) {
      console.error('[Analytics] Failed to track event:', error)
    }
  }

  // Identify user
  identifyUser(userId: string, properties?: BackendAnalyticsEventProperties): void {
    if (!this.posthog || !userId) return

    try {
      this.posthog.identify({
        distinctId: userId,
        properties: {
          ...properties,
          backend_identified: true,
          last_seen: new Date().toISOString()
        }
      })
    } catch (error) {
      console.error('[Analytics] Failed to identify user:', error)
    }
  }

  // Track WhatsApp events
  trackWhatsAppEvent(
    action: keyof typeof BACKEND_ANALYTICS_EVENTS.WHATSAPP,
    properties?: BackendAnalyticsEventProperties,
    userId?: string
  ): void {
    this.trackEvent(BACKEND_ANALYTICS_EVENTS.WHATSAPP[action], properties, userId)
  }

  // Track flow events
  trackFlowEvent(
    action: keyof typeof BACKEND_ANALYTICS_EVENTS.FLOW,
    flowId: string,
    properties?: BackendAnalyticsEventProperties,
    userId?: string
  ): void {
    this.trackEvent(BACKEND_ANALYTICS_EVENTS.FLOW[action], {
      flow_id: flowId,
      ...properties
    }, userId)
  }

  // Track email trigger events
  trackEmailTriggerEvent(
    action: keyof typeof BACKEND_ANALYTICS_EVENTS.EMAIL_TRIGGER,
    properties?: BackendAnalyticsEventProperties,
    userId?: string
  ): void {
    this.trackEvent(BACKEND_ANALYTICS_EVENTS.EMAIL_TRIGGER[action], properties, userId)
  }

  // Track job scraping events
  trackJobScrapingEvent(
    action: keyof typeof BACKEND_ANALYTICS_EVENTS.JOB_SCRAPER,
    properties?: BackendAnalyticsEventProperties,
    userId?: string
  ): void {
    this.trackEvent(BACKEND_ANALYTICS_EVENTS.JOB_SCRAPER[action], properties, userId)
  }

  // Track authentication events
  trackAuthEvent(
    action: keyof typeof BACKEND_ANALYTICS_EVENTS.AUTH,
    properties?: BackendAnalyticsEventProperties,
    userId?: string
  ): void {
    this.trackEvent(BACKEND_ANALYTICS_EVENTS.AUTH[action], properties, userId)
  }

  // Track agent events
  trackAgentEvent(
    action: keyof typeof BACKEND_ANALYTICS_EVENTS.AGENT,
    properties?: BackendAnalyticsEventProperties,
    userId?: string
  ): void {
    this.trackEvent(BACKEND_ANALYTICS_EVENTS.AGENT[action], properties, userId)
  }

  // Flush events (useful for serverless functions)
  async flush(): Promise<void> {
    if (!this.posthog) return

    try {
      await this.posthog.flush()
    } catch (error) {
      console.error('[Analytics] Failed to flush events:', error)
    }
  }

  // Shutdown PostHog client
  async shutdown(): Promise<void> {
    if (!this.posthog) return

    try {
      await this.posthog.shutdown()
      posthogClient = null
    } catch (error) {
      console.error('[Analytics] Failed to shutdown PostHog:', error)
    }
  }
}

// Singleton instance
let analyticsInstance: BackendAnalytics | null = null

// Get analytics instance
export const getAnalytics = (): BackendAnalytics => {
  if (!analyticsInstance) {
    analyticsInstance = new BackendAnalytics()
  }
  return analyticsInstance
}

// Convenience function for quick event tracking
export const trackBackendEvent = (
  eventName: string,
  properties?: BackendAnalyticsEventProperties,
  userId?: string
): void => {
  const analytics = getAnalytics()
  analytics.trackEvent(eventName, properties, userId)
}
