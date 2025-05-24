# WhatsApp Media Storage Enhancement

## Overview

This enhancement adds persistent, secure storage for WhatsApp media files (images and voice notes) to Firebase Storage with proper authentication and access controls, allowing the AI to reference them in future conversations.

## Key Features

1. **Secure Media Upload**: Images and voice notes are automatically uploaded to Firebase Storage with user-based access controls
2. **Authentication-Based Access**: Files can only be accessed by their owners through Firebase Authentication
3. **Chat History References**: File paths are stored in chat history and converted to signed URLs for AI access
4. **Organized Storage**: Files are organized by user and session ID with proper security rules
5. **Fallback Support**: System continues to work even if storage upload fails
6. **Graceful URL Generation**: Falls back to authenticated URLs when signed URLs are not available (e.g., in emulator)

## Security Model

### Firebase Storage Rules
- **User Access**: Authenticated users can only read their own media files under `whatsapp-media/{userId}/`
- **Backend Access**: Only Firebase Admin SDK (backend) can write/delete media files
- **Unauthorized Access**: Prevented through Firebase Authentication and path-based rules

### Access Patterns
- **Upload**: Backend only (via Admin SDK)
- **User Access**: Authenticated users for their own files
- **AI Access**: Temporary signed URLs (24-hour expiration) with fallback to authenticated URLs

### Emulator Environment
- **Signed URLs**: May not be available in emulator environment
- **Fallback**: System automatically falls back to authenticated URLs
- **Development**: Full functionality maintained during development

## File Structure

```
whatsapp-media/
├── {userId}/
│   ├── {sessionId}/
│   │   ├── image/
│   │   │   └── {uuid}.jpg
│   │   └── audio/
│   │       └── {uuid}.ogg
```

## Chat History Format

### Images
```
[Image Message] Caption: "User's caption"
Description: User sent an image with caption: "User's caption"
File Path: whatsapp-media/userId/sessionId/image/uuid.jpg
```

### Voice Messages
```
[Voice Message]
Transcription: "This is what the user said"
File Path: whatsapp-media/userId/sessionId/audio/uuid.ogg
```

**Note**: When chat history is prepared for AI, file paths are automatically converted to temporary signed URLs (or authenticated URLs as fallback).

## Implementation Details

### Core Functions

1. **`uploadMediaToStorage()`** - Uploads media buffers to Firebase Storage (returns file path)
2. **`getSignedMediaUrl()`** - Generates temporary signed URLs with fallback to authenticated URLs
3. **`getAuthenticatedMediaUrl()`** - Gets authenticated download URLs for user access
4. **`createMediaChatEntry()`** - Creates formatted chat history entries with file paths
5. **`prepareChatHistoryForAI()`** - Converts file paths to signed URLs for AI access

### Enhanced Processing Functions

- **`processWhatsAppImageWithStorage()`** - Enhanced image processing with secure storage
- **`transcribeWhatsAppAudioWithStorage()`** - Enhanced audio processing with secure storage

### Flow

1. **WhatsApp webhook receives media message**
2. **Media processed and downloaded** as before
3. **WhatsappAgent detects original message** and uses enhanced processing
4. **Media uploaded to Firebase Storage** with user-based path structure
5. **Chat history stores file path** (not public URL)
6. **AI access preparation**: File paths converted to signed URLs before sending to AI
7. **AI can reference media** through temporary signed URLs

### Error Handling

- If storage upload fails, the system continues with just the description
- Users still get full functionality even if storage is temporarily unavailable
- File access errors are logged and handled gracefully
- Invalid access attempts are blocked and logged
- **Signed URL failures**: Automatic fallback to authenticated URLs
- **Emulator support**: Graceful handling of signing limitations

## Security Benefits

1. **User Privacy**: Files are only accessible to their owners
2. **Secure AI Access**: Temporary signed URLs prevent unauthorized access
3. **Backend Control**: Only backend can upload/manage files
4. **Audit Trail**: All access attempts are logged
5. **Automatic Cleanup**: Signed URLs expire automatically
6. **Graceful Degradation**: System works even when signing is unavailable

## API Functions

### Storage Functions
```typescript
// Upload media (backend only)
uploadMediaToStorage(buffer, contentType, userId, mediaType, sessionId): Promise<string>

// Generate signed URL with fallback (for temporary access)
getSignedMediaUrl(filePath, expirationHours): Promise<string>

// Get authenticated URL for user access
getAuthenticatedMediaUrl(filePath): string
```

### AI Integration Functions
```typescript
// Prepare chat history for AI access
prepareChatHistoryForAI(chatHistory, requestingUserId): Promise<Array>

// Generate signed URLs for chat history
generateSignedUrlsForChatHistory(chatHistory, requestingUserId): Promise<Map>
```

## Testing

To test the functionality:

1. **Send media**: Send an image with caption to WhatsApp bot
2. **Check storage**: Verify file exists in Firebase Storage with correct path
3. **Check access**: Verify only the user can access their files
4. **Check chat history**: Verify file path is stored in Firestore
5. **Test AI access**: Send follow-up message asking about previous image
6. **Verify URLs**: AI should receive working signed URLs (or authenticated URLs in emulator)

## Troubleshooting

### Signed URL Issues
- **Error**: "Cannot sign data without `client_email`"
- **Solution**: System automatically falls back to authenticated URLs
- **In Production**: Ensure service account key is properly configured
- **In Emulator**: Fallback behavior is expected and normal

### Storage Access Issues
- **Check**: Firebase Storage rules are properly deployed
- **Verify**: User authentication is working
- **Confirm**: File paths match expected structure

## Storage Cleanup Recommendations

Consider implementing periodic cleanup of old media files based on:
- **File age**: Delete files older than 6 months
- **Session activity**: Delete files from inactive sessions
- **User preferences**: Allow users to control retention
- **Storage quotas**: Implement per-user storage limits

## Migration Notes

If upgrading from public URLs to secure storage:
- Existing public URLs will continue to work
- New uploads will use the secure file path system
- Consider migrating existing files to the new structure
- Update any hardcoded public URL references 