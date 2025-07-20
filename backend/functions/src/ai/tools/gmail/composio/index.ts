// Use dynamic import to fix CommonJS/ESM compatibility
let Composio: any;
let composioInstance: any = null;

const getComposioInstance = async () => {
    if (!composioInstance) {
        if (!Composio) {
            const composioModule = await import('@composio/core');
            Composio = composioModule.Composio;
        }
        composioInstance = new Composio({
            apiKey: process.env.COMPOSIO_API_KEY,
        });
    }
    return composioInstance;
};

import { goals_db } from '../../../../init.js';
import { Timestamp } from 'firebase-admin/firestore';
import { v4 as uuidv4 } from 'uuid';

/**
 * Get connected account for the user
 * Now checks both integrations subcollection and user document for backward compatibility
 */
export const getComposioGmailConnectedAccount = async (userId: string) => {
    try {
        // First, check the integrations subcollection (new approach)
        const integrationsQuery = await goals_db.collection('users')
            .doc(userId)
            .collection('integrations')
            .where('type', '==', 'EMAIL')
            .where('provider', '==', 'COMPOSIO')
            .get();

        if (!integrationsQuery.empty) {
            const gmailIntegration = integrationsQuery.docs[0].data();
            return gmailIntegration.composio_connected_account_id || gmailIntegration.id;
        }

        // Fallback: check the user document (old approach) for backward compatibility
        const userDoc = await goals_db.collection('users').doc(userId).get();
        const userData = userDoc.data();
        
        if (userData?.composio_gmail_connected_account_id) {
            // User has old-style connection but no integration document
            // Create the missing integration document for consistency
            console.log('Migrating old Gmail connection to integrations subcollection for user:', userId);
            
            const integrationId = uuidv4();
            await goals_db.collection('users').doc(userId).collection('integrations').doc(integrationId).set({
                id: integrationId,
                type: 'EMAIL',
                provider: 'COMPOSIO',
                integration_id: 'GMAIL',
                user_id: userId,
                created_at: Timestamp.fromDate(new Date()),
                updated_at: Timestamp.fromDate(new Date()),
                composio_connected_account_id: userData.composio_gmail_connected_account_id,
                connected_at: userData.composio_gmail_connected_at || new Date().toISOString(),
                migrated_from_user_doc: true, // Flag to indicate this was migrated
            });
            
            console.log('Gmail integration document created during migration with ID:', integrationId);
            return userData.composio_gmail_connected_account_id;
        }

        // If no connected account exists, user needs to connect first
        throw new Error('No Composio Gmail connected account found. Please connect your Gmail account first.');
    } catch (error) {
        console.error('Error getting Composio Gmail connected account:', error);
        throw error;
    }
};

/**
 * Get Gmail tools for the current user
 */
export const getComposioGmailTools = async (userId: string) => {
    const composio = await getComposioInstance();
    
    try {
        const tools = await composio.tools.get(userId, {
            toolkits: ['GMAIL'],
        });
        
        return tools;
    } catch (error) {
        console.error('Error getting Composio Gmail tools:', error);
        throw error;
    }
};

/**
 * Execute a Gmail tool using Composio
 */
export const executeComposioGmailTool = async (
    toolName: string,
    params: Record<string, any>,
    userId: string
) => {
    try {
        const composio = await getComposioInstance();
        const result = await composio.tools.execute(toolName, {
            userId,
            arguments: params,
        });
        
        return result;
    } catch (error) {
        console.error('Error executing Composio Gmail tool:', error);
        throw error;
    }
};



