import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { setupComposioGmailConnection, waitForGmailConnection } from './index';

/**
 * Firebase callable function to initiate Gmail connection with Composio
 */
export const setupComposioGmail = onCall({
    cors: true,
    region: 'us-central1'
}, async (request) => {
    try {
        if (!request.auth) {
            throw new HttpsError('unauthenticated', 'User must be authenticated');
        }

        const userId = request.auth.uid;
        
        // Set up Gmail connection
        const connectionResult = await setupComposioGmailConnection(userId);
        
        return {
            success: true,
            redirectUrl: connectionResult.redirectUrl,
            connectionId: connectionResult.connectionId,
            message: 'Please visit the redirect URL to authorize Gmail access'
        };
    } catch (error) {
        console.error('Error setting up Composio Gmail:', error);
        throw new HttpsError('internal', `Failed to set up Gmail connection: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
});

/**
 * Firebase callable function to check Gmail connection status
 */
export const checkComposioGmailConnection = onCall({
    cors: true,
    region: 'us-central1'
}, async (request) => {
    try {
        if (!request.auth) {
            throw new HttpsError('unauthenticated', 'User must be authenticated');
        }

        const userId = request.auth.uid;
        const { connectionId } = request.data;
        
        if (!connectionId) {
            throw new HttpsError('invalid-argument', 'Connection ID is required');
        }
        
        // Wait for connection to be established
        const isConnected = await waitForGmailConnection(userId, connectionId);
        
        return {
            success: isConnected,
            message: isConnected ? 'Gmail connection established successfully' : 'Gmail connection failed'
        };
    } catch (error) {
        console.error('Error checking Composio Gmail connection:', error);
        throw new HttpsError('internal', `Failed to check Gmail connection: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}); 