import { onCall, HttpsError } from 'firebase-functions/v2/https'
import { initialiseAIChat } from './ai/initialise'
import { setUserUid, setUserToolConfig } from './ai';
import { v4 as uuidv4 } from 'uuid';
import { goals_db } from './init';
import { Timestamp } from 'firebase-admin/firestore';

export const messageAgent = onCall({
    cors: true,
    region: 'us-central1'
}, async (request) => {
    try {
        if(!request.auth) throw new HttpsError('unauthenticated', 'Unauthorized')
        const uid = request.auth.uid;
        setUserUid(uid);
        const { history, agent, sessionId } = request.data;
        setUserToolConfig(agent.spec.toolsConfig);


        if (!history) throw new Error('Missing required parameter: prompt');

        // Use provided sessionId or generate a new one
        const conversationSessionId = sessionId || uuidv4();

        // Ensure the chat session exists in Firestore before processing
        const chatSessionRef = goals_db.collection('users').doc(uid).collection('chatSessions').doc(conversationSessionId);
        const chatSessionDoc = await chatSessionRef.get();

        if (!chatSessionDoc.exists) {
            // Create a new chat session if it doesn't exist
            await chatSessionRef.set({
                id: conversationSessionId,
                agent_id: agent.id,
                created_at: Timestamp.now(),
                updated_at: Timestamp.now(),
                messages: history.map((msg: any) => ({
                    ...msg,
                    timestamp: Timestamp.now()
                }))
            });
        }

        // Initialize chat with history from frontend, passing the sessionId for tool logging
        const result = await initialiseAIChat(history, agent, conversationSessionId);

        return {
            response: result,
            sessionId: conversationSessionId
        };

    } catch (error) {
        console.error('Error in messageAgent:', error);
        throw new HttpsError('internal', `${error}`);
    }
});



