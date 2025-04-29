import { goals_db } from '../../init';
import { setUserUid } from '../../ai';
import { initialiseAIChat } from '../../ai/initialise';
import { APICallError } from 'ai';
import { Timestamp } from 'firebase-admin/firestore';
import { v4 as uuidv4 } from 'uuid';

export const defaultGoalmaticAgent = {
    id: 0,
    name: 'Goalmatic 1.0',
    description: 'The Default plain agent for Goalmatic',
    published: true,
    user: {
        name: 'goalmatic'
    },
    spec: {
        systemInfo: 'You are a helpful assistant',
        tools: []
    },
    created_at: new Date('2025-01-01').toISOString()
}

/**
 * Helper function to update or create a chat session with a new message
 * @param chatSessionRef - Reference to the chat session document
 * @param chatSessionDoc - The chat session document snapshot
 * @param message - The message to add to the chat session
 * @param agentData - Data about the agent handling the conversation
 */
const updateChatSession = async (
    chatSessionRef: FirebaseFirestore.DocumentReference,
    chatSessionDoc: FirebaseFirestore.DocumentSnapshot,
    message: Record<string, any>,
    agentData: Record<string, any>
) => {
    try {
        if (chatSessionDoc.exists) {
            // Get the existing chat session data
            const chatSessionData = chatSessionDoc.data() || {};

            // Get the existing messages or initialize an empty array
            const messages = Array.isArray(chatSessionData.messages) ? chatSessionData.messages : [];

            // Add the new message
            messages.push(message);

            // Update the chat session
            await chatSessionRef.update({
                messages,
                updated_at: Timestamp.now()
            });
        } else {
            // Create a new chat session with the message
            await chatSessionRef.set({
                id: chatSessionRef.id,
                agent_id: agentData.id || '0',
                created_at: Timestamp.now(),
                updated_at: Timestamp.now(),
                messages: [message]
            });
        }
    } catch (error) {
        console.error('Error updating chat session:', error);
        throw error;
    }
};

export const WhatsappAgent = async (
    userDetails: Record<string, any>,
    userMsg: string | { isImage: boolean, buffer: Buffer, contentType: string } | { role: string, content: string } | { type: string, mimeType?: string, data?: Buffer, text?: string }[],
    agentData: Record<string, any>
) => {
    try {
        setUserUid(userDetails.user_id);

        // Generate a session ID for WhatsApp chats if not already present
        // We'll use the user's phone number or ID as a unique identifier
        const sessionId = userDetails.session_id || `whatsapp_${userDetails.user_id}`;

        // Reference to the user's chat session document
        const chatSessionRef = goals_db
            .collection('users')
            .doc(userDetails.user_id)
            .collection('chatSessions')
            .doc(sessionId);

        // Get the existing chat session or create a new one
        let chatSessionDoc = await chatSessionRef.get();
        let history: Record<string, any>[] = [];

        if (chatSessionDoc.exists) {
            // If chat session exists, get the messages
            const chatSessionData = chatSessionDoc.data();
            if (chatSessionData && Array.isArray(chatSessionData.messages)) {
                history = chatSessionData.messages.map(msg => ({
                    role: msg.role,
                    content: msg.content
                }));
            }
        }

        // Check if the message is an image
        let result: string;
        if (typeof userMsg === 'object' && 'isImage' in userMsg && userMsg.isImage) {
            // The message is an image - don't store it in history but pass it to the AI model

            // Add a placeholder message in the history
            const userMessage = {
                id: uuidv4(),
                role: 'user',
                content: 'I sent an image for analysis.',
                timestamp: Timestamp.now(),
                agent_id: agentData.id || '0'
            };

            // Add the user message to the history array for AI processing
            history.push({
                role: 'user',
                content: 'I sent an image for analysis.'
            });

            const imageMessages = [
                ...history,
                {
                    role: 'user',
                    content: [
                        {
                            type: 'file',
                            mimeType: userMsg.contentType || 'image/jpeg',
                            data: userMsg.buffer,
                        }
                    ],
                }
            ];

            // Pass the special image message array to the AI
            result = await initialiseAIChat(imageMessages, agentData, sessionId, true);

            // Update or create the chat session with the new message
            await updateChatSession(chatSessionRef, chatSessionDoc, userMessage, agentData);
        } else {
            // Normal message handling
            // Create the user message object
            let userMessageContent: string;

            // If userMsg is already in the format {role, content}, extract the content
            if (typeof userMsg === 'object' && 'role' in userMsg && 'content' in userMsg) {
                userMessageContent = userMsg.content as string;
                history.push(userMsg);
            } else {
                // Otherwise format it as a user message
                userMessageContent = userMsg as string || 'n/a';
                history.push({role: 'user', content: userMessageContent});
            }

            // Create the user message object for Firestore
            const userMessage = {
                id: uuidv4(),
                role: 'user',
                content: userMessageContent,
                timestamp: Timestamp.now(),
                agent_id: agentData.id || '0'
            };

            // Update or create the chat session with the new message
            await updateChatSession(chatSessionRef, chatSessionDoc, userMessage, agentData);

            // Get AI chat response with the updated history
            result = await initialiseAIChat(history, agentData, sessionId);
        }

        // Create the assistant message object for Firestore
        const assistantMessage = {
            id: uuidv4(),
            role: 'assistant',
            content: result ?? 'n/a',
            timestamp: Timestamp.now(),
            agent_id: agentData.id || '0'
        };

        // Append the assistant's response to the conversation history for the next interaction
        history.push({role: 'assistant', content: result ?? 'n/a'});

        // Update the chat session with the assistant's response
        await updateChatSession(chatSessionRef, chatSessionDoc, assistantMessage, agentData);

        return { data: agentData, status: 200, msg: `${result}` };

    } catch (e) {
        if (APICallError.isInstance(e)) {
            // Handle the error
            return { data: e, status: 500, msg: `An error occurred while processing your request, Please try again later` };
        }
        return { data: e, status: 500, msg: `Error in Whatsapp Agent: ${e}` };
    }
}


