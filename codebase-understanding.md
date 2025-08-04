# Goalmatic Codebase Understanding - Email Trigger Implementation

## Current Architecture Overview

### Backend Structure
- **Platform**: Firebase Functions with TypeScript
- **Database**: Firestore with dual-database architecture
- **Workflow Engine**: Upstash QStash for flow execution
- **Region**: us-central1
- **Email Service**: ZeptoMail (SendGrid-compatible API)

### Flow Execution System

#### Flow Structure
```typescript
interface FlowData {
  id: string;
  creator_id: string;
  name: string;
  status: number; // 0 = inactive, 1 = active
  trigger: FlowNode;
  steps: FlowNode[];
  schedule?: any; // For scheduled triggers
}
```

#### Flow Node Structure
```typescript
interface FlowNode {
  position: number;
  node_id: string; // e.g., 'SEND_EMAIL', 'SCHEDULE_TIME'
  icon: string;
  name: string;
  description: string;
  type: string; // 'trigger' | 'action'
  provider: string; // 'GOALMATIC', 'COMPOSIO', etc.
  category: string; // 'MESSAGING', 'DATETIME', etc.
  propsData: Record<string, any>;
  aiEnabledFields?: string[];
}
```

#### Execution Flow
1. **Trigger Activation** (`activateFlow`): Validates trigger and sets up scheduling
2. **Flow Execution** (`executeFlow`): Uses Upstash Workflow Context
3. **Step Processing**: Sequential execution through `runStepsInContext`
4. **Logging**: Automatic logging to `flows/{flowId}/logs/{executionId}`

### Current Trigger System

#### Existing Triggers
- `SCHEDULE_TIME`: One-time scheduled execution
- `SCHEDULE_INTERVAL`: Recurring scheduled execution (cron-based)

#### Trigger Handler Pattern
```
activateFlow/
├── index.ts (main handler)
├── validate.ts (flow validation)
└── triggerHandler/
    ├── index.ts (trigger router)
    ├── activateScheduleTime.ts
    └── activateScheduleInterval.ts
```

#### Trigger Activation Process
1. Validate flow and trigger configuration
2. Route to specific trigger handler based on `node_id`
3. Set up external scheduling (QStash for intervals)
4. Update flow status to active (status: 1)

### Node System Architecture

#### Node Registry (`availableNodes`)
- Centralized registry in `flowSteps/list.ts`
- Each node implements `NodeSignature` interface:
```typescript
interface NodeSignature {
  nodeId: string;
  run: (context: WorkflowContext, props: any, previousStepResult?: any) => Promise<any>;
}
```

#### Node Categories
- **Messaging**: `SEND_EMAIL`, `SEND_WHATSAPP_MESSAGE`
- **Calendar**: Google Calendar operations
- **Gmail**: Composio Gmail integration
- **Table**: Database operations
- **Web**: API calls and scraping
- **AI**: Agent and AI interactions

### Email Infrastructure

#### Current Email Sending
- **Service**: ZeptoMail (SendGrid-compatible)
- **Implementation**: `helpers/emailNotifier.ts`
- **Node**: `SEND_EMAIL` in `flowSteps/node/messaging/sendEmail.ts`
- **From Address**: `noreply@goalmatic.io`

#### Email Configuration
```typescript
interface EmailMessage {
  to: {email: string, name: string}[];
  from: {email: string, name: string};
  subject: string;
  message_body: {
    type: string; // 'text/html' | 'text/plain'
    value: string;
  };
}
```

### Frontend Structure

#### Flow Builder
- **Framework**: Nuxt.js/Vue.js
- **Trigger Nodes**: Defined in `frontend/src/composables/dashboard/flows/nodes/list/triggerNodes/`
- **Node Configuration**: Modal-based editing in `components/modals/flows/EditNode.vue`

#### Trigger Node Definition Pattern
```typescript
interface FlowNode {
  node_id: string;
  icon: string;
  name: string;
  description: string;
  type: 'trigger' | 'action';
  provider: string;
  category: string;
  children?: FlowNode[]; // For parent-child relationships
  props?: NodeProp[];
}
```

### Database Schema

#### Flows Collection (`/flows/{flowId}`)
```typescript
interface Flow {
  id: string;
  creator_id: string;
  name: string;
  description?: string;
  status: number; // 0 = inactive, 1 = active
  trigger: FlowNode;
  steps: FlowNode[];
  schedule?: any;
  public?: boolean;
  created_at: Timestamp;
  updated_at: Timestamp;
}
```

#### Flow Logs Subcollection (`/flows/{flowId}/logs/{logId}`)
```typescript
interface FlowLog {
  id: string;
  status: 'running' | 'completed' | 'failed';
  start_time: Timestamp;
  end_time?: Timestamp;
  duration?: string;
  trigger: string;
  steps_completed: number;
  steps_total: number;
  error?: string;
  creator_id: string;
  created_at: Timestamp;
}
```

### Security & Permissions

#### Firestore Rules Summary
- **Flows**: Creator-only access (read public flows allowed)
- **Flow Logs**: Creator-only access
- **Authentication**: Firebase Auth required for all operations
- **Validation**: Timestamp validation, data structure validation

### Current Limitations for Email Triggers

1. **No Email Receiving Infrastructure**: Only sending capability exists
2. **No Unique Address Generation**: No system for creating unique email addresses
3. **No Email Parsing**: No infrastructure for processing incoming emails
4. **No Webhook Handling**: No endpoints for receiving email notifications
5. **Security Gaps**: No abuse prevention for email triggers

### Integration Points for Email Trigger Implementation

#### Backend Extensions Needed
1. **Email Service Integration**: AWS SES or similar for receiving emails
2. **Webhook Endpoint**: New Firebase Function for email notifications
3. **Email Parser**: Extract sender, subject, body, attachments
4. **Trigger Handler**: New handler in `triggerHandler/` directory
5. **Database Schema**: Store unique email addresses and mappings

#### Frontend Extensions Needed
1. **Trigger Node Definition**: New email trigger node configuration
2. **UI Components**: Email address display and management
3. **Flow Builder Integration**: Drag-and-drop email trigger support

#### Security Considerations
1. **Domain Verification**: Ensure goalmatic.io domain ownership
2. **Rate Limiting**: Prevent abuse of email triggers
3. **Authentication**: Verify email trigger ownership
4. **Spam Protection**: Filter malicious emails
5. **Data Privacy**: Handle email content securely

### Recommended Implementation Approach

1. **Phase 1**: Backend email receiving infrastructure
2. **Phase 2**: Database schema and unique address generation
3. **Phase 3**: Email parsing and flow execution integration
4. **Phase 4**: Frontend trigger node and UI components
5. **Phase 5**: Security hardening and abuse prevention

This understanding will guide the implementation of the email-receiving trigger system while maintaining consistency with existing patterns and architecture.

## Email Trigger Implementation Summary

### ✅ Completed Implementation

The email-receiving trigger system has been fully implemented with the following components:

#### Backend Infrastructure

1. **Email Address Generation Service** (`email/generateEmailAddress.ts`)
   - Generates unique email addresses: `{userPrefix}{flowPrefix}{randomSuffix}@goalmatic.io`
   - Uses first 3 characters of user ID + first 3 characters of flow ID
   - Ensures uniqueness with random suffix
   - Firebase Cloud Function: `generateEmailAddress`

2. **Email Trigger Management** (`email/emailTriggerService.ts`)
   - Complete CRUD operations for email triggers
   - Validation and settings management
   - Rate limiting and security features
   - Statistics and testing functionality

3. **Zoho Mail Webhook Handler** (`email/zohoWebhookHandler.ts`)
   - Processes incoming emails from Zoho Mail outgoing webhooks
   - Email filtering and validation
   - Rate limiting enforcement
   - Flow execution triggering
   - Comprehensive logging

4. **Flow Activation Integration** (`flows/activateFlow/triggerHandler/activateEmailTrigger.ts`)
   - Seamlessly integrates with existing trigger system
   - Handles EMAIL_TRIGGER node activation
   - Manages pre-generated email addresses
   - Updates flow status and references

#### Frontend Components

1. **Email Trigger Node Definition** (`triggerNodes/email.ts`)
   - Comprehensive configuration options
   - 12 configurable properties including filtering, rate limiting, attachments
   - Uses `email_display` field type for unique email address

2. **Email Display Component** (`components/flows/EmailDisplayField.vue`)
   - Auto-generates email addresses on demand
   - Copy-to-clipboard functionality
   - Status indicators and instructions
   - Loading states and error handling

3. **Email Trigger Composable** (`composables/dashboard/flows/emailTrigger.ts`)
   - Email address generation logic
   - Clipboard operations
   - Validation and formatting utilities
   - State management

4. **Generic Node Configuration** (`nodeConfig/Generic.vue`)
   - Added support for `checkbox` and `email_display` field types
   - Integrated EmailDisplayField component
   - Maintains existing patterns and styling

#### Database Schema

1. **Email Triggers Collection** (`/emailTriggers/{triggerId}`)
   ```typescript
   interface EmailTrigger {
     id: string;
     flow_id: string;
     creator_id: string;
     unique_email: string;
     status: 'active' | 'inactive' | 'suspended';
     settings: EmailTriggerSettings;
     created_at: Timestamp;
     trigger_count: number;
   }
   ```

2. **Email Trigger Logs** (`/emailTriggerLogs/{logId}`)
   - Tracks all email processing attempts
   - Status tracking (processed/filtered/failed)
   - Execution linking and error reporting

#### Security Features

- **Unique Email Generation**: Unpredictable addresses prevent abuse
- **Sender Filtering**: Allow/block lists for email senders
- **Subject Filtering**: Include/exclude keywords
- **Rate Limiting**: Per-hour and per-day limits
- **Webhook Validation**: Optional signature verification
- **Spam Protection**: Built-in filtering capabilities

#### Configuration Options

- **Email Filtering**: Sender whitelist/blacklist, subject filters
- **Rate Limiting**: Configurable hourly/daily limits (1-1000/hour, 1-5000/day)
- **Attachments**: Size limits (1-50MB), file type restrictions
- **Auto-Reply**: Automated response capability
- **Processing Options**: Include/exclude email content and metadata

### 🔧 Setup Requirements

1. **Environment Variables**:
   ```bash
   ZOHO_WEBHOOK_SECRET=optional_webhook_secret
   ```

2. **Zoho Mail Configuration**:
   - Configure outgoing webhook in Zoho Mail Developer Space
   - Webhook URL: `https://your-domain/zohoEmailWebhook`
   - Event: `email_received`
   - Filter for emails to `@goalmatic.io` domain

3. **Domain Setup**:
   - Ensure `goalmatic.io` domain is configured in Zoho Mail
   - MX records properly configured for email reception

### 📧 Email Data Structure

Flows triggered by email receive this data structure:
```typescript
interface EmailFlowInput {
  from_email: string;
  from_name?: string;
  to_email: string; // The unique trigger email
  subject: string;
  body_text?: string;
  body_html?: string;
  received_at: string; // ISO timestamp
  message_id: string;
  headers: Record<string, string>;
  attachments?: Array<{
    filename: string;
    content_type: string;
    size_bytes: number;
    download_url?: string;
  }>;
  trigger_email: string;
  trigger_id: string;
}
```

### 🚀 Usage Flow

1. **User creates email trigger**: Selects EMAIL_TRIGGER node in flow builder
2. **Email generation**: Unique address auto-generated (e.g., `abc123def@goalmatic.io`)
3. **Configuration**: User configures filters, rate limits, and processing options
4. **Activation**: Flow activation creates email trigger in database
5. **Email reception**: External emails sent to unique address trigger webhook
6. **Processing**: System validates, filters, and executes associated flow
7. **Flow execution**: Email data available to all flow steps as `trigger-data`

### 🔄 Integration Points

- **Flow Builder**: EMAIL_TRIGGER node available in trigger selection
- **Flow Activation**: Seamlessly integrated with existing activation system
- **Flow Execution**: Email data passed through step execution pipeline
- **Logging**: Comprehensive logging in existing flow logs system
- **Security**: Follows existing authentication and authorization patterns

This implementation provides a complete, production-ready email trigger system that maintains consistency with the existing codebase architecture and patterns.