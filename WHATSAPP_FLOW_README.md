# WhatsApp Flow - Goalmatic Signup Implementation

## Overview

This implementation creates a WhatsApp Flow that mirrors the Goalmatic web signup process, allowing users to create accounts directly within WhatsApp.

## Flow Structure

### 1. SIGN_UP Screen
- **Purpose**: Collect user email and password
- **Fields**: 
  - Email address (with validation)
  - Password (minimum 6 characters)
  - Terms & Conditions acceptance checkbox
- **Action**: Creates Firebase Auth user and sends verification email
- **Error Handling**: Displays validation errors for email format, password length, and required fields

### 2. VERIFY Screen  
- **Purpose**: Guide user through email verification
- **Features**:
  - Shows the user's email address
  - Step-by-step verification instructions
  - Reminder to check spam folder
- **Action**: Checks if email has been verified
- **Error Handling**: Shows verification failures and session expiration errors

### 3. COMPLETE Screen
- **Purpose**: Welcome user and provide next steps
- **Features**:
  - Success confirmation
  - Welcome message
  - Call-to-action to access dashboard
- **Error Handling**: Shows completion errors with retry options

## Error Handling Features

### Error Display Components
- **Visual Indicators**: Errors are displayed with ❌ emoji and bold text
- **Conditional Rendering**: Uses WhatsApp Flow `If` components to show errors only when present
- **Structured Error Objects**: 
  ```typescript
  {
    message: "Error title",
    error_messages: ["Detailed error message"]
  }
  ```

### Validation Rules
1. **Email**: Must be provided and in valid format
2. **Password**: Minimum 6 characters required
3. **Terms**: Must be accepted to proceed
4. **Session**: User ID must be maintained between screens

### Common Error Scenarios
- **Password too short**: "Password must be at least 6 characters long"
- **Email already exists**: "This email is already registered. Please use a different email or try logging in"
- **Invalid email**: "Please enter a valid email address"
- **Missing fields**: "Please fill in all required fields"
- **Session expired**: "Please start the signup process again"

## Backend Implementation

### Endpoint: `whatsappFlowDataExchange`
**URL**: `https://us-central1-goalmatic.cloudfunctions.net/whatsappFlowDataExchange`

### Request Format
```json
{
  "version": "7.1",
  "action": "data_exchange", 
  "screen": "SIGN_UP|VERIFY|COMPLETE",
  "data": {
    // Screen-specific data
  },
  "flow_token": "unique_flow_token"
}
```

### Response Format
```json
{
  "screen": "CURRENT_OR_NEXT_SCREEN_ID",
  "data": {
    // Screen-specific response data
    "error": {
      "message": "Error description",
      "error_messages": ["User-friendly error messages"]
    }
  }
}
```

## Screen Handlers

### handleSignUp(data)
- **Input**: `{ email, password, accept_terms }`
- **Process**:
  1. Validates email format and password length
  2. Creates Firebase Auth user account
  3. Creates Firestore user document
  4. Generates email verification link
- **Output**: User ID and verification status
- **Navigation**: Automatically moves to VERIFY screen
- **Error Handling**: Returns to SIGN_UP screen with specific error messages

### handleVerify(data)  
- **Input**: `{ user_id, email }`
- **Process**:
  1. Looks up user in Firebase Auth
  2. Checks `emailVerified` status
  3. Updates Firestore document if verified
- **Output**: Verification status
- **Navigation**: Moves to COMPLETE screen if verified
- **Error Handling**: Shows retry messages for verification failures

### handleComplete(data)
- **Input**: `{ user_id }`
- **Process**:
  1. Updates user document with completion status
  2. Records completion timestamp
- **Output**: Success confirmation
- **Error Handling**: Shows completion errors with retry options

## Testing Error Handling

### Manual Testing Steps
1. **Test Password Validation**:
   - Enter password with < 6 characters
   - Should see: "❌ Password too short"

2. **Test Required Fields**:
   - Leave email or password empty
   - Should see: "❌ Email and password are required"

3. **Test Terms Acceptance**:
   - Don't check the terms checkbox
   - Should see: "❌ Terms acceptance required"

4. **Test Duplicate Email**:
   - Use an existing email address
   - Should see: "❌ Email already exists"

5. **Test Invalid Email**:
   - Enter malformed email (e.g., "invalid-email")
   - Should see: "❌ Invalid email format"

### Testing in Development
```bash
# Use WhatsApp Flow Builder for testing
# Or test via webhook with sample payloads
curl -X POST https://us-central1-goalmatic.cloudfunctions.net/whatsappFlowDataExchange \
  -H "Content-Type: application/json" \
  -d '{
    "action": "data_exchange",
    "screen": "SIGN_UP", 
    "data": {
      "email": "test@example.com",
      "password": "12", 
      "accept_terms": true
    },
    "flow_token": "test_token"
  }'
```

## Integration with Existing Codebase

### Mirrors Web Signup Flow
1. **Email/Password Creation**: Uses same Firebase Auth methods
2. **Email Verification**: Same verification process as `useEmailVerification` composable
3. **User Documents**: Creates identical Firestore user documents
4. **Error Handling**: Similar validation and error messages

### Authentication Flow Compatibility
- Users created via WhatsApp Flow are fully compatible with web authentication
- Same Firebase Auth user records
- Same Firestore user document structure
- Can log in via web or continue WhatsApp conversations

## Security Features

### Validation
- Email format validation
- Password minimum length (6 characters)
- Required terms acceptance
- Prevents duplicate accounts

### Error Handling
- User-friendly error messages
- Graceful fallbacks for Firebase errors
- Proper HTTP status codes
- Detailed logging for debugging
- **Error state management**: Errors are properly cleared on successful actions

### Data Protection
- No sensitive data stored in flow tokens
- Firebase Auth handles password hashing
- User data encrypted in Firestore
- HTTPS-only communication

## File Structure

```
backend/functions/src/whatsapp/
├── flowDataExchange.ts         # Main endpoint handler
├── webhook.ts                  # Existing WhatsApp webhook
└── utils/
    └── flows/
        └── signup.ts           # Signup flow logic with error handling

whatsapp_signup_flow.json       # WhatsApp Flow JSON definition with error components
```

## Deployment

1. **Deploy Firebase Functions**:
   ```bash
   cd backend/functions
   npm run deploy
   ```

2. **Test Error Handling**:
   - Use Flow Builder or direct API calls
   - Verify error messages appear correctly
   - Test all validation scenarios

## Troubleshooting

### Common Issues
1. **Errors not displaying**: Check Flow JSON has `If` components with proper conditions
2. **Validation not working**: Verify backend returns error objects in correct format
3. **Session issues**: Ensure `user_id` is properly passed between screens

### Debug Tips
- Check Firebase Function logs for backend errors
- Use Flow Builder preview for UI testing
- Verify all data schemas match between JSON and backend

## Future Enhancements

1. **Custom Verification**:
   - SMS verification as alternative
   - WhatsApp OTP integration

2. **Enhanced Data Collection**:
   - User preferences
   - Profile information
   - Marketing opt-ins

3. **Analytics Integration**:
   - Conversion tracking
   - User journey analysis
   - A/B testing capabilities 