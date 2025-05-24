import { getSignedMediaUrl, extractUserIdFromPath } from './mediaStorage';

/**
 * Extracts file paths from chat history and generates signed URLs for AI access
 * @param chatHistory - Array of chat messages
 * @param requestingUserId - User ID making the request (for authorization)
 * @returns Promise<Map<string, string>> - Map of file paths to signed URLs
 */
export async function generateSignedUrlsForChatHistory(
    chatHistory: Array<{ role: string; content: string; [key: string]: any }>,
    requestingUserId: string
): Promise<Map<string, string>> {
    const filePathToSignedUrl = new Map<string, string>();
    const filePathRegex = /File Path: (whatsapp-media\/[^\s\n]+)/g;
    
    // Extract all file paths from chat history
    const filePaths = new Set<string>();
    for (const message of chatHistory) {
        if (typeof message.content === 'string') {
            const matches = message.content.matchAll(filePathRegex);
            for (const match of matches) {
                filePaths.add(match[1]);
            }
        }
    }
    
    console.log(`Found ${filePaths.size} media files to process for user ${requestingUserId}`);
    
    // Generate signed URLs for each file path
    for (const filePath of filePaths) {
        try {
            // Verify the requesting user owns this file
            const fileUserId = extractUserIdFromPath(filePath);
            if (fileUserId !== requestingUserId) {
                console.warn(`User ${requestingUserId} attempted to access file owned by ${fileUserId}: ${filePath}`);
                continue;
            }
            
            // Generate signed URL (valid for 24 hours)
            const signedUrl = await getSignedMediaUrl(filePath, 24);
            filePathToSignedUrl.set(filePath, signedUrl);
            console.log(`Successfully generated URL for: ${filePath}`);
            
        } catch (error) {
            console.warn(`Failed to generate signed URL for ${filePath}, skipping:`, error instanceof Error ? error.message : error);
            // Continue with other files - don't let one failure stop the whole process
        }
    }
    
    console.log(`Successfully generated ${filePathToSignedUrl.size} media URLs for AI access`);
    return filePathToSignedUrl;
}

/**
 * Replaces file paths in chat content with signed URLs for AI access
 * @param content - Chat message content
 * @param filePathToSignedUrl - Map of file paths to signed URLs
 * @returns string - Content with file paths replaced by signed URLs
 */
export function replaceFilePathsWithSignedUrls(
    content: string,
    filePathToSignedUrl: Map<string, string>
): string {
    let updatedContent = content;
    
    for (const [filePath, signedUrl] of filePathToSignedUrl) {
        const filePathPattern = new RegExp(`File Path: ${filePath.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`, 'g');
        updatedContent = updatedContent.replace(filePathPattern, `Media URL: ${signedUrl}`);
    }
    
    return updatedContent;
}

/**
 * Prepares chat history for AI by replacing file paths with accessible URLs
 * @param chatHistory - Array of chat messages
 * @param requestingUserId - User ID making the request
 * @returns Promise<Array> - Chat history with accessible media URLs
 */
export async function prepareChatHistoryForAI(
    chatHistory: Array<{ role: string; content: string; [key: string]: any }>,
    requestingUserId: string
): Promise<Array<{ role: string; content: string; [key: string]: any }>> {
    try {
        // Generate signed URLs for all media files in the chat history
        const filePathToSignedUrl = await generateSignedUrlsForChatHistory(chatHistory, requestingUserId);
        
        // If no signed URLs were generated, return original history
        if (filePathToSignedUrl.size === 0) {
            console.log('No media URLs generated, returning original chat history');
            return chatHistory;
        }
        
        // Replace file paths with signed URLs in chat content
        return chatHistory.map(message => {
            if (typeof message.content === 'string') {
                return {
                    ...message,
                    content: replaceFilePathsWithSignedUrls(message.content, filePathToSignedUrl)
                };
            }
            return message;
        });
        
    } catch (error) {
        console.error('Error preparing chat history for AI, returning original history:', error);
        // Return original history as fallback
        return chatHistory;
    }
} 