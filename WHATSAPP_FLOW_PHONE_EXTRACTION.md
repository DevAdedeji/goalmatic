# WhatsApp Flows: Phone Number Extraction Solution

## 🚨 **The Problem**

When implementing WhatsApp Flows with data exchange endpoints, **you cannot extract the user's phone number** from the Flow webhook payload in the same way you would from regular WhatsApp message webhooks.

## 🔍 **Why This Happens**

### Regular WhatsApp Message Webhooks
```json
{
  "object": "whatsapp_business_account",
  "entry": [{
    "changes": [{
      "value": {
        "contacts": [{"wa_id": "PHONE_NUMBER"}],
        "messages": [{
          "from": "PHONE_NUMBER",
          "id": "MESSAGE_ID",
          "text": {"body": "MESSAGE_TEXT"},
          "type": "text"
        }]
      }
    }]
  }]
}
```

### WhatsApp Flow Data Exchange Webhooks
```json
{
  "version": "3.0",
  "action": "INIT|data_exchange|BACK",
  "screen": "SCREEN_NAME", 
  "data": { /* form data */ },
  "flow_token": "your-session-identifier"
}
```

**❌ NO `entry`, `changes`, `messages`, or `contacts` structure!**

## ✅ **The Solution**

### Option 1: Encode Phone Number in `flow_token` (Recommended)

When sending the Flow message, encode the phone number in the `flow_token`:

```typescript
// When sending Flow message
const flow_token = JSON.stringify({
  phone: user_phone_number,
  session: generateUniqueId(),
  timestamp: Date.now()
});

// Or base64 encode it for security
const flow_token = Buffer.from(JSON.stringify({
  phone: user_phone_number,
  session: generateUniqueId()
})).toString('base64');
```

### Option 2: Use Session Storage

Store the phone number in a database/cache using the `flow_token` as the key:

```typescript
// When sending Flow
const flow_token = generateUniqueId();
await storeSession(flow_token, { phone: user_phone_number });

// In Flow endpoint
const session = await getSession(flow_token);
const phone_number = session.phone;
```

### Option 3: Extract from Flow Completion Webhook

For Flow completion messages, the phone number IS available in the webhook:

```json
{
  "entry": [{
    "changes": [{
      "value": {
        "messages": [{
          "from": "PHONE_NUMBER",
          "interactive": {
            "nfm_reply": {
              "response_json": "flow_response_data"
            }
          }
        }]
      }
    }]
  }]
}
```

## 🛠 **Implementation**

### Updated Flow Token Extraction Function

```typescript
function extractPhoneFromFlowToken(flow_token: string): string | null {
  try {
    // Try JSON parsing
    const parsed = JSON.parse(flow_token);
    if (parsed.phone) return parsed.phone;
  } catch {}
  
  // Try base64 decoding
  try {
    const decoded = Buffer.from(flow_token, 'base64').toString('utf-8');
    const parsed = JSON.parse(decoded);
    if (parsed.phone) return parsed.phone;
  } catch {}
  
  // Try delimited format: phone:+1234567890:session:uuid
  if (flow_token.includes(':')) {
    const parts = flow_token.split(':');
    const phoneIndex = parts.findIndex(part => part === 'phone');
    if (phoneIndex !== -1 && phoneIndex + 1 < parts.length) {
      return parts[phoneIndex + 1];
    }
  }
  
  return null;
}
```

### Updated Flow Data Exchange Handler

```typescript
// ⚠️ Flow data exchange webhooks DO NOT contain phone numbers!
console.log("🔍 Raw request body:", JSON.stringify(req.body, null, 2));
console.log("📋 Decrypted Flow data:", JSON.stringify(decryptedBody, null, 2));

let phoneNumber: string | null = null;

try {
  phoneNumber = extractPhoneFromFlowToken(decryptedBody.flow_token);
  if (phoneNumber) {
    console.log("📱 Phone number extracted from flow_token:", phoneNumber);
    decryptedBody.webhook_phone_number = phoneNumber;
  } else {
    console.warn("❌ No phone number found in flow_token");
  }
} catch (error) {
  console.warn("⚠️ Failed to extract phone from flow_token:", error);
}
```

## 📚 **References**

- [WhatsApp Flows Documentation](https://developers.facebook.com/docs/whatsapp/flows/)
- [Implementing Flow Endpoints](https://developers.facebook.com/docs/whatsapp/flows/guides/implementingyourflowendpoint/)
- [WhatsApp Webhook Payload Examples](https://developers.facebook.com/docs/whatsapp/cloud-api/webhooks/payload-examples/)

## 🎯 **Key Takeaways**

1. **Flow data exchange webhooks ≠ Message webhooks**
2. **Phone numbers must be passed via `flow_token` or stored separately**
3. **The `flow_token` is your session identifier - design it accordingly**
4. **Flow completion webhooks DO contain phone numbers**
5. **Always handle cases where phone number is unavailable**

## ⚡ **Next Steps**

1. **Update your Flow sending logic** to encode phone numbers in `flow_token`
2. **Test the extraction function** with your specific `flow_token` format
3. **Implement proper error handling** for missing phone numbers
4. **Consider security implications** of encoding phone numbers in tokens 