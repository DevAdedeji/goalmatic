# Composio Gmail Integration Examples

This document provides practical examples of how to use the Composio Gmail integration in your agents.

## Example 1: Email Assistant Agent

Create an agent that can help users manage their emails:

```typescript
const emailAssistantAgent = {
  name: "Email Assistant",
  description: "Helps you manage your Gmail emails",
  systemInfo: `
    You are an email assistant that helps users manage their Gmail emails.
    You can send emails, read emails, and create drafts.
    Always be helpful and professional in your responses.
  `,
  tools: [
    { id: "COMPOSIO_GMAIL_SEND_EMAIL" },
    { id: "COMPOSIO_GMAIL_READ_EMAILS" },
    { id: "COMPOSIO_GMAIL_CREATE_DRAFT" }
  ]
};
```

## Example 2: Automated Email Responses

Use the tools to create automated email responses:

```typescript
// Example conversation flow
User: "Send a thank you email to john@example.com"

// Agent will use COMPOSIO_GMAIL_SEND_EMAIL with:
{
  to: "john@example.com",
  subject: "Thank you",
  body: "Thank you for your time and consideration.",
  isHtml: false
}
```

## Example 3: Email Search and Summarization

Create an agent that can search and summarize emails:

```typescript
User: "Show me all unread emails from my boss"

// Agent will use COMPOSIO_GMAIL_READ_EMAILS with:
{
  query: "is:unread from:boss@company.com",
  maxResults: 10
}

// Then provide a summary of the emails
```

## Example 4: Draft Email Creation

Create drafts for later sending:

```typescript
User: "Create a draft email to schedule a meeting with the team"

// Agent will use COMPOSIO_GMAIL_CREATE_DRAFT with:
{
  to: "team@company.com",
  subject: "Team Meeting - Schedule Request",
  body: "Hi team,\n\nI'd like to schedule a meeting to discuss our upcoming project. Please let me know your availability for next week.\n\nBest regards",
  isHtml: false
}
```

## Example 5: Email Workflow Automation

Create complex email workflows:

```typescript
const emailWorkflowAgent = {
  name: "Email Workflow Manager",
  systemInfo: `
    You are an email workflow manager. You can:
    1. Read incoming emails
    2. Categorize them based on content
    3. Create appropriate responses
    4. Send follow-up emails
    
    Always ask for confirmation before sending emails.
  `,
  tools: [
    { id: "COMPOSIO_GMAIL_READ_EMAILS" },
    { id: "COMPOSIO_GMAIL_SEND_EMAIL" },
    { id: "COMPOSIO_GMAIL_CREATE_DRAFT" }
  ]
};
```

## Example 6: Integration with Other Tools

Combine Gmail tools with other available tools:

```typescript
const comprehensiveAgent = {
  name: "Comprehensive Assistant",
  systemInfo: `
    You are a comprehensive assistant that can:
    - Manage emails through Gmail
    - Search the internet for information
    - Create calendar events
    - Work with tables and data
  `,
  tools: [
    { id: "COMPOSIO_GMAIL_SEND_EMAIL" },
    { id: "COMPOSIO_GMAIL_READ_EMAILS" },
    { id: "SEARCH_TOOL" },
    { id: "GOOGLECALENDAR_CREATE_EVENT" },
    { id: "TABLE_CREATE" }
  ]
};
```

## Example 7: Frontend Integration

Frontend code to set up Composio Gmail:

```vue
<template>
  <div>
    <button 
      @click="connectGmail" 
      :disabled="loading"
      class="btn btn-primary"
    >
      <span v-if="loading">Connecting...</span>
      <span v-else>Connect Gmail via Composio</span>
    </button>
  </div>
</template>

<script setup lang="ts">
import { useComposioGmail } from '@/composables/dashboard/integrations/gmail/composio'

const { loading, connect: connectGmail } = useComposioGmail()
</script>
```

## Example 8: Error Handling

Handle common errors gracefully:

```typescript
// In your agent tool configuration
const gmailToolConfig = {
  COMPOSIO_GMAIL_SEND_EMAIL: {
    errorHandling: {
      authError: "Please reconnect your Gmail account",
      rateLimitError: "Gmail API rate limit reached. Please try again later.",
      networkError: "Network error occurred. Please check your connection."
    }
  }
};
```

## Example 9: Email Templates

Create reusable email templates:

```typescript
const emailTemplates = {
  thankYou: {
    subject: "Thank you for your time",
    body: "Thank you for taking the time to meet with me. I look forward to our continued collaboration."
  },
  followUp: {
    subject: "Following up on our conversation",
    body: "I wanted to follow up on our recent conversation. Please let me know if you have any questions."
  },
  meeting: {
    subject: "Meeting Request",
    body: "I would like to schedule a meeting to discuss {topic}. Please let me know your availability."
  }
};
```

## Example 10: Scheduled Email Sending

Use with workflow automation:

```typescript
// In a flow step
const scheduleEmailStep = {
  nodeId: "SCHEDULE_EMAIL",
  type: "action",
  props: {
    toolId: "COMPOSIO_GMAIL_SEND_EMAIL",
    parameters: {
      to: "{{recipient}}",
      subject: "{{subject}}",
      body: "{{body}}"
    }
  }
};
```

## Best Practices

1. **Always validate email addresses** before sending
2. **Use meaningful subject lines** for better email organization
3. **Handle authentication errors** gracefully
4. **Respect rate limits** and implement retry logic
5. **Test with your own email first** before sending to others
6. **Use HTML formatting** sparingly and only when necessary
7. **Provide clear error messages** to users
8. **Log important operations** for debugging

## Common Use Cases

- **Customer Support**: Automated responses to common queries
- **Lead Management**: Follow-up emails to prospects
- **Internal Communications**: Status updates and notifications
- **Event Management**: Meeting invitations and reminders
- **Content Distribution**: Newsletter and announcement sending
- **Project Updates**: Progress reports and milestone notifications

## Security Considerations

- Never log sensitive email content
- Validate all input parameters
- Use HTTPS for all communications
- Follow OAuth best practices
- Implement proper error handling
- Monitor for unusual activity patterns 