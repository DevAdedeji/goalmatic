import { onCall, HttpsError } from 'firebase-functions/v2/https'
import { initialiseAIChat } from './ai/initialise'
import {  setUserUid, setUserToolConfig } from './ai';




export const messageAgent = onCall({ 
    cors: true, 
    region: 'us-central1' 
}, async (request) => {
    try {
        if(!request.auth) throw new HttpsError('unauthenticated', 'Unauthorized')
        const uid = request.auth.uid;
        setUserUid(uid);
        const {history, agent } = request.data;
        setUserToolConfig(agent.spec.toolsConfig);

    
        if (!history) throw new Error('Missing required parameter: prompt');

        // Initialize chat with history from frontend
        const result = await initialiseAIChat(history, agent)


        
        return {
            response: result,
        };

    } catch (error) {
        console.error('Error in messageAgent:', error);
        throw new HttpsError('internal', `${error}`);
    }
});



