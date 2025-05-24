# WhatsApp Webhook Duplicate Prevention

## Overview

This document explains the idempotent message processing system implemented for WhatsApp webhooks to prevent duplicate message processing.

## The Problem

WhatsApp webhooks, like most webhook systems, implement "at least once delivery" which means:
- Messages can be delivered multiple times due to network timeouts, server issues, or delivery confirmations not being received
- This can lead to duplicate processing of the same message
- Without proper handling, this can cause issues like:
  - Multiple AI responses to the same user message
  - Duplicate database entries
  - Inconsistent state

## The Solution: Idempotency

We implemented an idempotent message processing system that ensures each unique WhatsApp message is processed exactly once, regardless of how many times the webhook is received.

### Key Components

#### 1. Message ID Tracking (`isDuplicateMessage` function)
- **Location**: `backend/functions/src/whatsapp/webhookHelpers.ts`
- **Purpose**: Check if a message has been processed before and mark new messages as processed
- **Storage**: Uses Firestore collection `processed_messages` with document ID = WhatsApp message ID
- **TTL**: Messages are stored for 24 hours with automatic expiration

#### 2. Early Duplicate Detection
- **Location**: `backend/functions/src/whatsapp/webhook.ts` (lines 33-38)
- **When**: Happens immediately after parsing the webhook event, before any processing
- **Action**: If duplicate detected, returns HTTP 200 immediately without processing

#### 3. Automatic Cleanup
- **Location**: `backend/functions/src/whatsapp/cleanup.ts`
- **Purpose**: Scheduled function to remove expired message tracking records
- **Schedule**: Runs every 6 hours to delete records older than 24 hours
- **Batch Processing**: Processes up to 500 records per run to avoid timeouts

## Implementation Details

### Message Processing Flow

```
1. Webhook receives POST request
2. Parse webhook event to extract message data
3. Check if message.id exists in processed_messages collection
4. If exists: Return 200 OK (duplicate detected)
5. If not exists: Mark as processed and continue normal flow
6. Process message normally
7. Return 200 OK
```

### Database Schema

**Collection**: `processed_messages`
**Document ID**: WhatsApp message ID (e.g., `wamid.HBgNMjM...`)
**Fields**:
```typescript
{
  processed_at: Date,    // When the message was first processed
  expires_at: Date       // When this record should be cleaned up (24h later)
}
```

### Error Handling

- If duplicate checking fails, the message is processed anyway (fail-safe approach)
- This ensures that system issues don't cause message loss
- All errors are logged for debugging

## Security

- The `processed_messages` collection is protected by Firestore security rules
- Only Cloud Functions (with admin privileges) can read/write to this collection
- Client applications have no access to this internal tracking data

## Benefits

1. **Prevents Duplicate Processing**: Each message processed exactly once
2. **Maintains User Experience**: No duplicate AI responses
3. **Database Consistency**: Prevents duplicate entries and state corruption
4. **Cost Optimization**: Reduces unnecessary AI API calls and compute usage
5. **Automatic Cleanup**: Self-maintaining system with no manual intervention needed

## Monitoring

Key metrics to monitor:
- Number of duplicate messages detected (via console logs)
- Size of `processed_messages` collection
- Cleanup function execution success rate
- Any errors in the `isDuplicateMessage` function

## Testing

To test duplicate prevention:
1. Send a message via WhatsApp
2. Manually trigger the same webhook payload multiple times
3. Verify only one response is sent and only one database entry is created
4. Check logs for "Duplicate message detected" entries

## References

Based on industry best practices for webhook idempotency:
- [Postmark Blog: Why Idempotency is Important](https://postmarkapp.com/blog/why-idempotency-is-important)
- [Progressive Coder: Handling Duplicate Events](https://progressivecoder.substack.com/p/how-to-handle-disastrous-duplicate)
- [Facebook Developer Community](https://developers.facebook.com/community/threads/435282849333929/) 