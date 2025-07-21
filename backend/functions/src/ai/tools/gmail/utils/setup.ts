import { onCall, HttpsError } from 'firebase-functions/v2/https';
// @ts-ignore
import { Composio } from '@composio/core';
import { is_dev } from '../../../../init';

/**
 * Firebase callable function to initiate Gmail connection with Composio
 */

const COMPOSIO_API_KEY = is_dev ? process.env.COMPOSIO_API_KEY_DEV : process.env.COMPOSIO_API_KEY_PROD;

const gmailAuthConfigId = is_dev ? 'ac_2-tTrIlhH1J4' : 'ac_2-tTrIlhH1J4';
export const setupComposioGmail = onCall(
    {
        cors: true,
        region: 'us-central1',
    },
    async (request) => {

        try {
            if (!request.auth) {
                throw new HttpsError('unauthenticated', 'User must be authenticated');
            }

            const userId = request.auth.uid;

            const composio = new Composio({ apiKey: COMPOSIO_API_KEY });

            const response = await composio.connectedAccounts.initiate(userId, gmailAuthConfigId, {
                allowMultiple: true
            });



            return {
                success: true,
                redirectUrl: response.redirectUrl,
                connectionId: response.id,
                message: 'Please visit the redirect URL to authorize Gmail access',
            };
        } catch (error) {
            console.error('Error setting up Composio Gmail:', error);
            throw new HttpsError(
                'internal',
                `Failed to set up Gmail connection: ${error instanceof Error ? error.message : 'Unknown error'}`
            );
        }
    }
);



export const checkComposioGmailConnection = onCall({
    cors: true,
    region: 'us-central1'
}, async (request) => {
    try {
        if (!request.auth) {
            throw new HttpsError('unauthenticated', 'User must be authenticated');
        }
        const composio = new Composio({ apiKey: COMPOSIO_API_KEY });
        const { connectionId } = request.data;
        
        if (!connectionId) {
            throw new HttpsError('invalid-argument', 'connectedAccountId is required');
        }
        
        const maxAttempts = 30;
        let attempts = 0;

        while (attempts < maxAttempts) { 
            const connection = await composio.connectedAccounts.waitForConnection(connectionId);

            if (connection.params?.status === 'ACTIVE') {
                return {
                    success: true,
                    message: 'Gmail connection established successfully',
                    data: {
                        ...connection.params,
                        id: connectionId
                    }
                };
            }
        }

    } catch (error) {
        console.error('Error checking Composio Gmail connection:', error);
        throw new HttpsError('internal', `Failed to check Gmail connection: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}); 