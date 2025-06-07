import { goals_db } from '../../init';
import { getUserUid, getWhatsAppPhone } from '../index';
import { Timestamp } from 'firebase-admin/firestore';
import { v4 as uuidv4 } from 'uuid';
import { get_WA_TextMessageInput, send_WA_Message } from '../../whatsapp/utils/sendMessage';
import { HttpsError } from 'firebase-functions/https';
/**
 * Checks if a session ID is a WhatsApp session
 *
 * @param sessionId The chat session ID
 * @returns True if the session is a WhatsApp session
 */
const isWhatsAppSession = (sessionId: string): boolean => {
  return sessionId.startsWith('whatsapp_');
};

/**
 * Formats a tool call message for WhatsApp
 *
 * @param toolId The ID of the tool being called
 * @param parameters The parameters passed to the tool
 * @returns Formatted message string
 */
const formatToolCallForWhatsApp = (toolId: string, parameters: Record<string, any>): string => {
  return `🔧 *Tool Call:* ${toolId}\n\n*Parameters:*\n\`\`\`\n${JSON.stringify(parameters, null, 2)}\n\`\`\``;
};

/**
 * Sends a tool call message to a WhatsApp user
 *
 * @param uid User ID
 * @param toolId Tool ID
 * @param parameters Tool parameters
 */
const sendToolCallToWhatsApp = async (uid: string, toolId: string, parameters: Record<string, any>): Promise<void> => {
  try {
    // First check if we have a cached WhatsApp phone number
    let phoneNumber = getWhatsAppPhone();

    // If no cached phone number, get it from Firestore
    if (!phoneNumber) {
      throw new HttpsError('not-found', `User ${uid} has no phone number set, something went wrong`);
    }

    // Format the tool call message for WhatsApp
    const message = formatToolCallForWhatsApp(toolId, parameters);

    // Send the message to WhatsApp
    const messageInput = get_WA_TextMessageInput(phoneNumber, message);
    await send_WA_Message(messageInput);


  } catch (error) {
    throw new HttpsError('internal', `${error}`);
  }
};

/**
 * Logs a tool call to the Firestore chat history
 *
 * @param sessionId The chat session ID
 * @param toolId The ID of the tool being called
 * @param parameters The parameters passed to the tool
 */
export const logToolCall = async (sessionId: string, toolId: string, parameters: Record<string, any>): Promise<void> => {
  try {
    const uid = getUserUid();
    if (!uid || !sessionId) {
      throw new HttpsError('invalid-argument', 'Cannot log tool call: Missing user ID or session ID');
    }

    // Enforce showLogs setting
    const userRef = goals_db.collection('users').doc(uid);
    const userDoc = await userRef.get();
    const userData = userDoc.data();
    if (!userData || userData.showLogs !== true) {
      // Logging is disabled for this user
      return;
    }

    const chatSessionRef = goals_db.collection('users').doc(uid).collection('chatSessions').doc(sessionId);
    const chatSessionDoc = await chatSessionRef.get();

    if (!chatSessionDoc.exists) {
      throw new HttpsError('not-found', `Chat session ${sessionId} not found for user ${uid}`);
    }

    const chatSessionData = chatSessionDoc.data();
    if (!chatSessionData) {
      throw new HttpsError('not-found', `Chat session ${sessionId} data is empty`)  ;
    }

    if (isWhatsAppSession(sessionId)) {
       await sendToolCallToWhatsApp(uid, toolId, parameters);
    }

    const messages = Array.isArray(chatSessionData.messages) ? chatSessionData.messages : [];

    const toolCallMessage = {
      id: uuidv4(),
      role: 'assistant',
      toolId: toolId,
      parameters: parameters,
      timestamp: Timestamp.now(),
      content: `Tool call: ${toolId} with parameters: ${JSON.stringify(parameters)}`
    };


    messages.push(toolCallMessage);

    await chatSessionRef.update({
      messages,
      updated_at: Timestamp.now()
    });




  } catch (error) {
    throw new HttpsError('internal', `${error}`);
  }
};
