import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { v4 as uuidv4 } from 'uuid';
import { Timestamp } from 'firebase-admin/firestore';
import { goals_db } from '../init';

interface ShareChatSessionData {
  sessionId: string;
}

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'tool';
  content: string;
  timestamp: Timestamp;
  agent_id: string;
  toolId?: string;
  parameters?: Record<string, any>;
  messageType?: string;
}

interface ChatSession {
  id: string;
  agent_id: string;
  created_at: Timestamp;
  updated_at: Timestamp;
  messages: ChatMessage[];
  summary?: string;
  shortId?: string;
  user_id: string;
}

interface PublicChatSession {
  id: string;
  publicId: string;
  agent_id: string;
  creator_id: string;
  created_at: Timestamp;
  shared_at: Timestamp;
  messages: ChatMessage[];
  summary?: string;
  original_session_id: string;
}

export const shareChatSession = onCall({cors: true, region: 'us-central1'}, async (request) => {
  try {
    // Check if user is authenticated
    if (!request.auth) {
      throw new HttpsError('unauthenticated', 'User must be authenticated');
    }

    const { sessionId } = request.data as ShareChatSessionData;
    const userId = request.auth.uid;

    if (!sessionId) {
      throw new HttpsError('invalid-argument', 'Session ID is required');
    }

    // Get the original chat session document to verify ownership
    const chatSessionRef = goals_db.collection('users').doc(userId).collection('chatSessions').doc(sessionId);
    const chatSessionDoc = await chatSessionRef.get();

    if (!chatSessionDoc.exists) {
      throw new HttpsError('not-found', 'Chat session not found');
    }

    const chatSessionData = chatSessionDoc.data() as ChatSession;
    
    // Verify that the session has messages to share
    if (!chatSessionData.messages || chatSessionData.messages.length === 0) {
      throw new HttpsError('invalid-argument', 'Cannot share an empty chat session');
    }

    // Generate a unique public ID for the shared session
    const publicId = uuidv4();
    const publicSessionId = `public_${publicId}`;

    // Helper function to remove undefined properties
    const cleanObject = (obj: any) => {
      const cleaned: any = {};
      for (const [key, value] of Object.entries(obj)) {
        if (value !== undefined) {
          cleaned[key] = value;
        }
      }
      return cleaned;
    };

    // Create the public chat session data (excluding private information)
    const publicChatSession: PublicChatSession = cleanObject({
      id: publicSessionId,
      publicId: publicId,
      agent_id: chatSessionData.agent_id,
      creator_id: userId,
      created_at: chatSessionData.created_at,
      shared_at: Timestamp.now(),
      messages: chatSessionData.messages.map(msg => cleanObject({
        id: msg.id,
        role: msg.role,
        content: msg.content,
        timestamp: msg.timestamp,
        agent_id: msg.agent_id,
        toolId: msg.toolId,
        parameters: msg.parameters,
        messageType: msg.messageType
      })),
      summary: chatSessionData.summary,
      original_session_id: sessionId
    });

    // Store the public chat session in a separate collection
    const publicChatRef = goals_db.collection('publicChats').doc(publicSessionId);
    await publicChatRef.set(publicChatSession);

    // Generate the shareable URL
    const baseUrl = process.env.FUNCTIONS_EMULATOR === 'true' 
      ? 'http://localhost:3000' 
      : 'https://goalmatic.com';  // Replace with your actual domain
    
    const shareUrl = `${baseUrl}/share/${publicId}`;

    console.log(`Successfully created public chat session ${publicSessionId} from session ${sessionId} for user ${userId}`);

    return {
      success: true,
      publicId: publicId,
      shareUrl: shareUrl,
      message: 'Chat session shared successfully'
    };

  } catch (error) {
    console.error('Error sharing chat session:', error);
    
    if (error instanceof HttpsError) {
      throw error;
    }
    
    throw new HttpsError('internal', `Failed to share chat session: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}); 