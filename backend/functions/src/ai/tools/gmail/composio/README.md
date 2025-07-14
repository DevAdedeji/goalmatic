# Composio Gmail Integration

This module provides Gmail integration using Composio.io for seamless email management capabilities.

## Features

- **Send Emails**: Send emails through Gmail using Composio
- **Read Emails**: Fetch and read emails from Gmail inbox
- **Create Drafts**: Create email drafts in Gmail
- **Easy Authentication**: Simplified OAuth flow through Composio

## Setup

### 1. Environment Variables

Add the following environment variable to your Firebase Functions configuration:

```bash
# Composio API Key
COMPOSIO_API_KEY=your_composio_api_key_here
```

### 2. Get Composio API Key

1. Sign up at [Composio.io](https://composio.io)
2. Navigate to your dashboard
3. Copy your API key
4. Add it to your environment variables

### 3. Firebase Functions Environment

```bash
firebase functions:config:set composio.api_key="your_composio_api_key_here"
```

## Usage

### Available Tools

The following tools are available in the agent system:

- `COMPOSIO_GMAIL_SEND_EMAIL`: Send emails through Gmail
- `COMPOSIO_GMAIL_READ_EMAILS`: Read emails from Gmail
- `COMPOSIO_GMAIL_CREATE_DRAFT`: Create draft emails in Gmail

### Setting Up Gmail Connection

Use the Firebase callable function to initiate Gmail connection:

```typescript
import { getFunctions, httpsCallable } from 'firebase/functions';

const functions = getFunctions();
const setupGmail = httpsCallable(functions, 'setupComposioGmail');

// Initiate Gmail connection
const result = await setupGmail();
const { redirectUrl, connectionId } = result.data;

// Direct user to redirectUrl for OAuth authorization
window.open(redirectUrl, '_blank');
```

### Checking Connection Status

```typescript
const checkConnection = httpsCallable(functions, 'checkComposioGmailConnection');

const result = await checkConnection({ connectionId });
const { success } = result.data;
```

### Using Gmail Tools in Agents

Once connected, the tools will be available in the agent system:

```typescript
// Example agent configuration
const agentConfig = {
  tools: [
    { id: 'COMPOSIO_GMAIL_SEND_EMAIL' },
    { id: 'COMPOSIO_GMAIL_READ_EMAILS' },
    { id: 'COMPOSIO_GMAIL_CREATE_DRAFT' }
  ]
};
```

## Tool Parameters

### COMPOSIO_GMAIL_SEND_EMAIL

```typescript
{
  to: string;           // Recipient email address
  subject: string;      // Email subject
  body: string;         // Email body content
  isHtml?: boolean;     // Whether body is HTML (optional)
}
```

### COMPOSIO_GMAIL_READ_EMAILS

```typescript
{
  query?: string;       // Gmail search query (optional)
  maxResults?: number;  // Max emails to retrieve (optional)
  labelIds?: string[];  // Label IDs to filter (optional)
}
```

### COMPOSIO_GMAIL_CREATE_DRAFT

```typescript
{
  to: string;           // Recipient email address
  subject: string;      // Email subject
  body: string;         // Email body content
  isHtml?: boolean;     // Whether body is HTML (optional)
}
```

## Error Handling

The integration includes comprehensive error handling:

- Authentication errors
- API rate limiting
- Network connectivity issues
- Invalid parameters

## Benefits of Composio Integration

1. **Simplified Authentication**: No need to manage OAuth tokens directly
2. **Unified API**: Consistent interface across different email providers
3. **Built-in Error Handling**: Robust error management and retry logic
4. **Scalability**: Handles multiple user connections efficiently
5. **Security**: Secure token management through Composio

## Troubleshooting

### Common Issues

1. **Authentication Errors**: Ensure COMPOSIO_API_KEY is set correctly
2. **Connection Timeout**: Check internet connectivity and Composio service status
3. **Permission Denied**: Verify user has completed OAuth flow

### Debug Mode

Enable debug logging by setting:

```javascript
console.log('Composio Gmail Debug Mode Enabled');
```

## Support

For issues related to:
- Composio API: Check [Composio Documentation](https://docs.composio.io)
- Gmail API: Review [Gmail API Documentation](https://developers.google.com/gmail/api)
- Integration bugs: Contact development team 