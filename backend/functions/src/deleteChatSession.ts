import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { getStorage } from 'firebase-admin/storage';
import firebaseServer from './init';
import { goals_db } from './init';

// Initialize Firebase Storage
const storage = getStorage(firebaseServer()!);

interface DeleteChatSessionData {
  sessionId: string;
}

export const deleteChatSession = onCall({cors: true, region: 'us-central1'}, async (request) => {
  try {
    // Check if user is authenticated
    if (!request.auth) {
      throw new HttpsError('unauthenticated', 'User must be authenticated');
    }

    const { sessionId } = request.data as DeleteChatSessionData;
    const userId = request.auth.uid;

    if (!sessionId) {
      throw new HttpsError('invalid-argument', 'Session ID is required');
    }

    // Get the chat session document to verify ownership and get file paths
    const chatSessionRef = goals_db.collection('users').doc(userId).collection('chatSessions').doc(sessionId);
    const chatSessionDoc = await chatSessionRef.get();

    if (!chatSessionDoc.exists) {
      throw new HttpsError('not-found', 'Chat session not found');
    }

    const chatSessionData = chatSessionDoc.data();
    
    // Extract file paths from messages for storage cleanup
    const filePaths: string[] = [];
    if (chatSessionData?.messages && Array.isArray(chatSessionData.messages)) {
      for (const message of chatSessionData.messages) {
        if (typeof message.content === 'string') {
          // Extract file paths using regex
          const filePathRegex = /File Path: (whatsapp-media\/[^\s\n]+)/g;
          let match;
          while ((match = filePathRegex.exec(message.content)) !== null) {
            filePaths.push(match[1]);
          }
        }
      }
    }

    console.log(`Found ${filePaths.length} files to delete for session ${sessionId}`);

    // Delete storage files
    const bucket = storage.bucket();
    const deletePromises: Promise<void>[] = [];

    for (const filePath of filePaths) {
      // Verify the file belongs to the requesting user
      if (filePath.startsWith(`whatsapp-media/${userId}/`)) {
        const file = bucket.file(filePath);
        deletePromises.push(
          file.delete().then(() => {}).catch((error) => {
            console.warn(`Failed to delete file ${filePath}:`, error.message);
          })
        );
      } else {
        console.warn(`User ${userId} attempted to delete file not owned by them: ${filePath}`);
      }
    }

    // Wait for all file deletions to complete (or fail gracefully)
    await Promise.all(deletePromises);

    // Delete the chat session document
    await chatSessionRef.delete();

    console.log(`Successfully deleted chat session ${sessionId} and ${filePaths.length} associated files for user ${userId}`);

    return {
      success: true,
      sessionId,
      deletedFiles: filePaths.length,
      message: 'Chat session and associated files deleted successfully'
    };

  } catch (error) {
    console.error('Error deleting chat session:', error);
    
    if (error instanceof HttpsError) {
      throw error;
    }
    
    throw new HttpsError('internal', `Failed to delete chat session: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}); 