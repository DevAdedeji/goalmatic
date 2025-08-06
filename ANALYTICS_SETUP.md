# PostHog Analytics Implementation

This document outlines the PostHog analytics implementation with cost-conscious configuration for the Goalmatic application.

## Overview

The analytics implementation includes:
- **Frontend tracking**: User interactions, page views, authentication flows, flow management
- **Backend tracking**: WhatsApp messaging, email triggers, flow execution, job scraping
- **Cost optimization**: Disabled autocapture, session recordings, and other expensive features
- **Centralized service**: Consistent event naming and tracking across the application

## Environment Variables

### Frontend (.env)
```bash
# PostHog Configuration
VITE_POSTHOG_PUBLIC_KEY=your_posthog_public_key_here
```

### Backend (Firebase Functions Environment)
```bash
# PostHog Configuration
POSTHOG_API_KEY=your_posthog_api_key_here
POSTHOG_HOST=https://us.i.posthog.com
```

To set backend environment variables:
```bash
firebase functions:config:set posthog.api_key="your_posthog_api_key_here"
firebase functions:config:set posthog.host="https://us.i.posthog.com"
```

## Cost Optimization Features

### Frontend Configuration
- ✅ **Autocapture disabled**: Manual event tracking only
- ✅ **Session recordings disabled**: No session replay data
- ✅ **Person profiles**: Only for identified users
- ✅ **Performance data filtered**: Excludes expensive performance metrics
- ✅ **Sampling ready**: Can be configured if volume becomes high

### Backend Configuration
- ✅ **Batch processing**: Events sent in batches of 20
- ✅ **Flush intervals**: 10-second intervals to reduce API calls
- ✅ **Development disabled**: No tracking in development environment
- ✅ **Timeout controls**: 3-second request timeout

## Event Categories

### Frontend Events

#### Authentication
- `auth_login_started`
- `auth_login_success`
- `auth_login_failed`
- `auth_signup_started`
- `auth_signup_success`
- `auth_signup_failed`
- `auth_logout`
- `auth_google_auth_started`
- `auth_google_auth_success`
- `auth_google_auth_failed`
- `auth_phone_otp_sent`
- `auth_phone_otp_verified`

#### Flow Management
- `flow_created`
- `flow_updated`
- `flow_deleted`
- `flow_activated`
- `flow_deactivated`
- `flow_executed`
- `flow_execution_failed`

#### Node Configuration
- `node_added`
- `node_removed`
- `node_configured`
- `node_tested`
- `node_test_success`
- `node_test_failed`

#### UI Interactions
- `page_view`
- `button_click`
- `modal_opened`
- `modal_closed`

### Backend Events

#### WhatsApp
- `whatsapp_message_received`
- `whatsapp_message_sent`
- `whatsapp_otp_sent`
- `whatsapp_otp_verified`
- `whatsapp_signup_flow_started`
- `whatsapp_signup_completed`

#### Flow Execution
- `flow_execution_started`
- `flow_execution_completed`
- `flow_execution_failed`
- `flow_step_executed`
- `flow_step_failed`

#### Email Triggers
- `email_trigger_created`
- `email_trigger_activated`
- `email_trigger_email_received`
- `email_trigger_flow_triggered`

#### Job Scraping
- `job_scraper_scrape_started`
- `job_scraper_scrape_completed`
- `job_scraper_scrape_failed`
- `job_scraper_jobs_found`

## Usage Examples

### Frontend
```typescript
import { useAnalytics } from '@/composables/core/analytics/posthog'

const { trackAuthEvent, trackFlowEvent, trackEvent } = useAnalytics()

// Track authentication
trackAuthEvent('LOGIN_SUCCESS', { method: 'email', user_id: 'user123' })

// Track flow creation
trackFlowEvent('CREATED', 'flow-id-123', { 
  flow_name: 'My Flow', 
  flow_type: 'standard' 
})

// Track custom event
trackEvent('custom_event', { property: 'value' })
```

### Backend
```typescript
import { getAnalytics } from '../utils/analytics'

const analytics = getAnalytics()

// Track WhatsApp message
analytics.trackWhatsAppEvent('MESSAGE_RECEIVED', {
  message_type: 'text',
  from_phone: '+1234567890'
})

// Track flow execution
analytics.trackFlowEvent('EXECUTION_STARTED', 'flow-id-123', {
  trigger_type: 'email',
  execution_id: 'exec-456'
}, 'user-id-789')
```

## Testing

### Analytics Test Page
Visit `/analytics-test` to test all analytics events in development mode. This page provides buttons to trigger various events and shows the event data in the console.

### Development Mode
- Frontend: Events are logged to console with `[PostHog Mock]` prefix
- Backend: Events are logged to console with `[Analytics]` prefix
- No actual data is sent to PostHog in development

### Production Verification
1. Check PostHog dashboard for incoming events
2. Verify event properties are correctly structured
3. Monitor event volume and costs
4. Adjust sampling rates if needed

## Cost Monitoring

### Key Metrics to Monitor
- **Event volume**: Total events per month
- **User sessions**: Active user count
- **Data ingestion**: Amount of data processed
- **API calls**: Number of requests to PostHog

### Cost Control Measures
1. **Sampling**: Reduce event volume by sampling percentage
2. **Event filtering**: Remove non-essential events
3. **Property reduction**: Limit event properties
4. **Batch optimization**: Increase batch sizes and intervals

### Sampling Configuration
If costs become high, enable sampling:

```typescript
// Frontend - in posthog.client.ts
sampling: {
  events: 0.5, // 50% of events
  session_recordings: 0.0 // 0% session recordings
}

// Backend - in analytics.ts
// Implement custom sampling logic in trackEvent method
```

## Maintenance

### Regular Tasks
- [ ] Monitor PostHog usage and costs monthly
- [ ] Review event volume and optimize if needed
- [ ] Update event schemas as features evolve
- [ ] Clean up unused events and properties

### Performance Optimization
- [ ] Batch events efficiently
- [ ] Use appropriate flush intervals
- [ ] Monitor backend function execution times
- [ ] Optimize event property sizes

## Troubleshooting

### Common Issues
1. **Events not appearing**: Check API keys and network connectivity
2. **High costs**: Review sampling rates and event volume
3. **Missing properties**: Verify event structure and property names
4. **Development data**: Ensure development mode is properly configured

### Debug Mode
Enable debug logging by setting:
```bash
# Frontend
localStorage.setItem('posthog_debug', 'true')

# Backend
console.log('[Analytics Debug]', eventData)
```

## Security Considerations

- API keys are environment-specific
- No sensitive data in event properties
- User identification uses hashed/anonymized IDs
- GDPR compliance through PostHog settings
- Data retention policies configured in PostHog dashboard
