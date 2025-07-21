import { getUserUid } from "../../index";
import { tool } from 'ai';
import { z } from 'zod';
// @ts-ignore
import { Composio } from '@composio/core';
import { is_dev } from '../../../init';
import { goals_db } from '../../../init'



const COMPOSIO_API_KEY = is_dev ? process.env.COMPOSIO_API_KEY_DEV : process.env.COMPOSIO_API_KEY_PROD;

const readGmailEmails = async (params: {
    query?: string;
    maxResults?: number;
    labelIds?: string[];
}) => {


    const uid = getUserUid();
    const composio = new Composio({ apiKey: COMPOSIO_API_KEY });
    // Verify access and get credentials

    const allIntegrations = await goals_db.collection('users')
        .doc(uid)
        .collection('integrations').where('type', '==', 'EMAIL').where('provider', '==', 'GOOGLE_COMPOSIO').get()

    const composioIntegration = allIntegrations.docs[0].data()
    const connectionId = composioIntegration.connection_id
    // Initialize Gmail service


    try {
        const { data } = await composio.tools.execute('GMAIL_FETCH_EMAILS', {
            userId: uid,
            connectedAccountId: connectionId,
            arguments: {
                max_results: 20,
                include_payload: true,
                verbose:true
            }
        }) as any;



        // Extract only essential email data to reduce token usage
        const processedEmails = data.messages?.map((email: any) => ({
            messageId: email.messageId,
            threadId: email.threadId,
            sender: email.sender,
            subject: email.subject,
            to: email.to,
            messageTimestamp: email.messageTimestamp,
            labelIds: email.labelIds,
            preview: email.preview,
            messageText: email.messageText ? 
                (email.messageText.length > 1000 ? 
                    email.messageText.substring(0, 1000) + '...[truncated]' : 
                    email.messageText) : 
                undefined,
            attachmentList: email.attachmentList || []
        }));

        return processedEmails;
    

    } catch (error) {
        console.error('Error reading Gmail emails:', error);
        throw new Error('Failed to read emails');
    }
};

const readGmailEmailsTool = tool({
    description: "Reads emails from the user's Gmail inbox",
    parameters: z.object({
        query: z.string().optional().describe("Gmail search query (e.g., 'from:example@gmail.com', 'is:unread')"),
        maxResults: z.number().optional().describe("Maximum number of emails to retrieve (default: 10)"),
        labelIds: z.array(z.string()).optional().describe("Label IDs to filter emails"),
    }),
    execute: async (input: any) => {
        try {
            const emails = await readGmailEmails(input);
            return emails;
        } catch (error) {
            throw new Error('Failed to read emails');
        }
    }
});

export const GMAIL_READ_EMAILS = {
    id: "GMAIL_READ_EMAILS",
    tool: readGmailEmailsTool
}; 