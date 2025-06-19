# WhatsApp Flow Data Exchange - Encryption Setup

This document explains how to set up and use the encrypted WhatsApp Flow endpoint.

## Overview

WhatsApp Flows require all data exchange between WhatsApp and your endpoint to be encrypted using a combination of RSA and AES encryption:

1. **RSA Encryption**: Used to encrypt the AES key
2. **AES-128-GCM Encryption**: Used to encrypt the actual flow data

## Setup Instructions

### 1. Generate RSA Key Pair

Generate a private key for encryption/decryption:

```bash
# Generate private key (use this method for compatibility)
openssl genrsa -out private_key.pem 2048

# Extract public key (to upload to WhatsApp)
openssl rsa -pubout -in private_key.pem -out public_key.pem

# Optional: Generate with passphrase protection
openssl genrsa -aes256 -out private_key.pem 2048

# If you have a PKCS#8 encrypted key, convert it to PKCS#1:
openssl rsa -in encrypted_private_key.pem -out private_key.pem
```

### 2. Configure Environment Variable

Add your private key to your Firebase Functions environment:

```bash
# Set the private key as an environment variable
firebase functions:config:set whatsapp.flow_private_key="$(cat private_key.pem)"
```

Or in your `.env` file for local development:

```env
WHATSAPP_FLOW_PRIVATE_KEY="-----BEGIN RSA PRIVATE KEY-----
MIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC...
-----END RSA PRIVATE KEY-----"
WHATSAPP_FLOW_PASSPHRASE="your-passphrase-here"
```

### 3. Upload Public Key to WhatsApp

1. Go to WhatsApp Business Manager
2. Navigate to your WhatsApp Flow configuration
3. Upload the `public_key.pem` file in the encryption settings

## Request/Response Format

### Encrypted Request (from WhatsApp)

```json
{
    "encrypted_flow_data": "SH16...P9LU=",
    "encrypted_aes_key": "wXO2O...lLug==",
    "initial_vector": "Grws...4MiA=="
}
```

### Decrypted Request Content

```json
{
    "action": "INIT",
    "flow_token": "<Flow token from the flow message>",
    "version": "3.0"
}
```

```json
{
    "action": "data_exchange",
    "screen": "SIGN_UP",
    "data": {
        "email": "user@example.com",
        "password": "password123"
    },
    "flow_token": "<Flow token>",
    "version": "3.0"
}
```

### Response Format

```json
{
    "screen": "VERIFY",
    "data": {
        "user_email": "user@example.com",
        "verification_sent": true
    }
}
```

### Encrypted Response (to WhatsApp)

```json
{
    "encrypted_flow_data": "aB3dE...fG7hI="
}
```

## Testing

### Development Mode (Unencrypted)

For testing purposes, the endpoint supports unencrypted requests when `WHATSAPP_FLOW_PRIVATE_KEY` is not set:

```bash
curl -X POST https://your-endpoint.com/whatsappFlowDataExchange \
  -H "Content-Type: application/json" \
  -d '{
    "action": "INIT",
    "flow_token": "test_token",
    "version": "3.0"
  }'
```

### Production Mode (Encrypted)

In production, requests must be encrypted and the private key must be configured.

## Flow Navigation

The endpoint supports these actions:

- **INIT**: Initial flow launch → Returns SIGN_UP screen
- **data_exchange**: Handle user input on current screen
- **BACK**: Navigate back to previous screen

## Screens

1. **SIGN_UP**: User enters email and password
2. **VERIFY**: User verifies their email
3. **COMPLETE**: Registration completion

## Error Handling

All errors are returned in this format:

```json
{
    "error": {
        "message": "Error description",
        "error_messages": ["Detailed error message for user"]
    }
}
```

## Security Considerations

1. **Private Key Storage**: Never commit private keys to version control
2. **Environment Variables**: Use secure environment variable storage
3. **Key Rotation**: Regularly rotate your encryption keys
4. **Logging**: Avoid logging decrypted data in production

## Troubleshooting

### Common Issues

1. **Decryption Failed**: Check private key format and environment variable
2. **Invalid Request**: Ensure proper JSON format and required fields
3. **Key Mismatch**: Verify public key uploaded to WhatsApp matches your private key

### Debug Mode

Set logging level to see detailed encryption/decryption information:

```typescript
console.log('Decryption debug:', {
    hasPrivateKey: !!WHATSAPP_FLOW_PRIVATE_KEY,
    isEncrypted,
    requestSize: JSON.stringify(req.body).length
})
``` 