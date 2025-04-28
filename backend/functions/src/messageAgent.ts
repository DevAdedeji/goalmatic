import { onCall, HttpsError } from 'firebase-functions/v2/https'
import { initialiseAIChat } from './ai/initialise'
import { setUserUid, setUserToolConfig } from './ai';
import { v4 as uuidv4 } from 'uuid';

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

        // Initialize chat with history from frontend
        const result = await initialiseAIChat(history, agent)

        // Store the conversation history with the sessionId
        // In a production app, you would store this in Firestore
        // For example:
        // await admin.firestore().collection('conversations').doc(conversationSessionId).set({
        //     userId: uid,
        //     agentId: agent.id,
        //     history: history,
        //     updatedAt: admin.firestore.FieldValue.serverTimestamp()
        // }, { merge: true });

        return {
            response: result,
            sessionId: conversationSessionId
        };

    } catch (error) {
        console.error('Error in messageAgent:', error);
        throw new HttpsError('internal', `${error}`);
    }
});



