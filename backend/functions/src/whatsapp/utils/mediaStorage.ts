import { getStorage } from 'firebase-admin/storage';
import firebaseServer from '../../init';
import { v4 as uuidv4 } from 'uuid';

// Initialize Firebase Storage
const storage = getStorage(firebaseServer()!);

/**
 * Uploads a media buffer to Firebase Storage and returns the file path
 * @param buffer - The media file buffer
 * @param contentType - The MIME type of the media
 * @param userId - The user ID for organizing files
 * @param mediaType - Type of media (image, audio)
 * @param sessionId - Chat session ID for organization
 * @returns Promise<string> - The file path in storage
 */
export async function uploadMediaToStorage(
    buffer: Buffer,
    contentType: string,
    userId: string,
    mediaType: 'image' | 'audio',
    sessionId: string
): Promise<string> {
    try {
        // Generate unique filename
        const fileId = uuidv4();
        const fileExtension = getFileExtension(contentType);
        const fileName = `${fileId}.${fileExtension}`;
        
        // Create storage path: whatsapp-media/{userId}/{sessionId}/{mediaType}/{fileName}
        const filePath = `whatsapp-media/${userId}/${sessionId}/${mediaType}/${fileName}`;
        
        // Get bucket reference
        const bucket = storage.bucket();
        const file = bucket.file(filePath);
        
        // Upload file with metadata
        await file.save(buffer, {
            metadata: {
                contentType: contentType,
                metadata: {
                    uploadedBy: 'whatsapp-webhook',
                    userId: userId,
                    sessionId: sessionId,
                    mediaType: mediaType,
                    timestamp: new Date().toISOString()
                }
            }
        });
        
        // Return the file path (not public URL)
        return filePath;
        
    } catch (error) {
        console.error('Error uploading media to storage:', error);
        throw new Error(`Failed to upload ${mediaType} to storage: ${error}`);
    }
}

/**
 * Generates a signed URL for temporary access to a media file
 * Falls back to authenticated URL if signing is not available (e.g., in emulator)
 * @param filePath - The file path in storage
 * @param expirationHours - Hours until the URL expires (default: 24)
 * @returns Promise<string> - The signed URL or authenticated URL as fallback
 */
export async function getSignedMediaUrl(
    filePath: string,
    expirationHours: number = 24
): Promise<string> {
    // Check if running in emulator environment
    const isEmulator = process.env.FUNCTIONS_EMULATOR === 'true' || 
                      process.env.FIREBASE_STORAGE_EMULATOR_HOST ||
                      process.env.NODE_ENV === 'development';
    
    if (isEmulator) {
        console.log(`Emulator environment detected, using authenticated URL for: ${filePath}`);
        return getAuthenticatedMediaUrl(filePath);
    }
    
    try {
        const bucket = storage.bucket();
        const file = bucket.file(filePath);
        
        const [signedUrl] = await file.getSignedUrl({
            action: 'read',
            expires: Date.now() + expirationHours * 60 * 60 * 1000 // Convert hours to milliseconds
        });
        
        console.log(`Generated signed URL for: ${filePath}`);
        return signedUrl;
    } catch (error) {
        console.warn(`Failed to generate signed URL for ${filePath}, falling back to authenticated URL:`, error instanceof Error ? error.message : error);
        
        // Fallback to authenticated URL when signing is not available
        // This happens in emulator or when using default credentials without signing capabilities
        return getAuthenticatedMediaUrl(filePath);
    }
}

/**
 * Gets an authenticated download URL for a media file
 * This URL can be used by authenticated users to access their own files
 * Uses localhost URL when running in emulator environment
 * @param filePath - The file path in storage
 * @returns string - The authenticated download URL
 */
export function getAuthenticatedMediaUrl(filePath: string): string {
    const bucket = storage.bucket();
    
    // Check if running in emulator environment
    const isEmulator = process.env.FUNCTIONS_EMULATOR === 'true' || 
                      process.env.FIREBASE_STORAGE_EMULATOR_HOST ||
                      process.env.NODE_ENV === 'development';
    
    if (isEmulator) {
        // Use emulator URL - default Firebase Storage emulator runs on localhost:9199
        const emulatorHost = process.env.FIREBASE_STORAGE_EMULATOR_HOST || 'localhost:9199';
        const protocol = emulatorHost.includes('localhost') ? 'http' : 'https';
        return `${protocol}://${emulatorHost}/v0/b/${bucket.name}/o/${encodeURIComponent(filePath)}?alt=media`;
    }
    
    // Production URL for Firebase Storage
    return `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${encodeURIComponent(filePath)}?alt=media`;
}

/**
 * Gets file extension from content type
 * @param contentType - The MIME type
 * @returns string - File extension
 */
function getFileExtension(contentType: string): string {
    const extensionMap: Record<string, string> = {
        'image/jpeg': 'jpg',
        'image/jpg': 'jpg',
        'image/png': 'png',
        'image/gif': 'gif',
        'image/webp': 'webp',
        'audio/ogg': 'ogg',
        'audio/mpeg': 'mp3',
        'audio/mp4': 'm4a',
        'audio/aac': 'aac',
        'audio/wav': 'wav'
    };
    
    return extensionMap[contentType.toLowerCase()] || 'bin';
}

/**
 * Creates a chat history entry for media with both description and file reference
 * @param mediaType - Type of media (image, audio)
 * @param description - Text description (transcription for audio, caption for image)
 * @param filePath - Storage file path
 * @param caption - Optional caption for images
 * @returns string - Formatted chat history content
 */
export function createMediaChatEntry(
    mediaType: 'image' | 'audio',
    description: string,
    filePath: string,
    caption?: string
): string {
    if (mediaType === 'image') {
        const captionText = caption ? ` Caption: "${caption}"` : '';
        return `[Image Message]${captionText}\nDescription: ${description}\nFile Path: ${filePath}`;
    } else if (mediaType === 'audio') {
        return `[Voice Message]\nTranscription: ${description}\nFile Path: ${filePath}`;
    }
    
    return `[Media Message]\nContent: ${description}\nFile Path: ${filePath}`;
}

/**
 * Utility function to extract user ID from a file path
 * @param filePath - The storage file path
 * @returns string | null - The user ID or null if not found
 */
export function extractUserIdFromPath(filePath: string): string | null {
    const match = filePath.match(/^whatsapp-media\/([^\/]+)\//);
    return match ? match[1] : null;
} 