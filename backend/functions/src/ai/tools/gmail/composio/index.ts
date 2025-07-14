const { Composio } = require('@composio/core');
import { goals_db } from '../../../../init.js';

// Initialize Composio client
const composio = new Composio({
    apiKey: process.env.COMPOSIO_API_KEY,
});

/**
 * Get or create a connected account for the user
 */
export const getComposioGmailConnectedAccount = async (userId: string) => {
    try {
        // Try to get existing connected account
        const userDoc = await goals_db.collection('users').doc(userId).get();
        const userData = userDoc.data();
        
        if (userData?.composio_gmail_connected_account_id) {
            return userData.composio_gmail_connected_account_id;
        }

        // If no connected account exists, we need to create one
        // This would typically involve OAuth flow or using existing Gmail credentials
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
    try {
        const tools = await composio.tools.get(userId, {
            toolkits: ['gmail'],
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

/**
 * Set up Gmail connection for a user
 */
export const setupComposioGmailConnection = async (userId: string) => {
    try {
        // Initialize connection request
        const connectionRequest = await composio.toolkits.authorize(userId, "gmail");
        
        return {
            redirectUrl: connectionRequest.redirectUrl,
            connectionId: connectionRequest.connectionId,
        };
    } catch (error) {
        console.error('Error setting up Composio Gmail connection:', error);
        throw error;
    }
};

/**
 * Wait for Gmail connection to be established
 */
export const waitForGmailConnection = async (userId: string, connectionId: string) => {
    try {
        // This would wait for the connection to be active
        // Implementation depends on Composio's connection status API
        const maxAttempts = 30;
        let attempts = 0;
        
        while (attempts < maxAttempts) {
            try {
                const tools = await composio.tools.get(userId, {
                    toolkits: ['gmail'],
                });
                
                if (tools && tools.length > 0) {
                    // Connection is ready
                    await goals_db.collection('users').doc(userId).update({
                        composio_gmail_connected_account_id: connectionId,
                        composio_gmail_connected_at: new Date().toISOString(),
                    });
                    
                    return true;
                }
            } catch (error) {
                // Connection not ready yet
            }
            
            attempts++;
            await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds
        }
        
        throw new Error('Gmail connection timeout');
    } catch (error) {
        console.error('Error waiting for Gmail connection:', error);
        throw error;
    }
}; 