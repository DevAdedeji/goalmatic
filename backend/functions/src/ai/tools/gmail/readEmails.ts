import { google } from 'googleapis';
import { verifyGmailAccess } from "./verify";
import { getUserUid } from "../../index";
import { getGmailAuthClient } from './utils/tokenManager';
import { tool } from 'ai';
import { z } from 'zod';

const readGmailEmails = async (params: {
    query?: string;
    maxResults?: number;
    labelIds?: string[];
}) => {
    const uid = getUserUid();
    // Verify access and get credentials
    const { exists, credentials } = await verifyGmailAccess(uid);
    if (!exists) throw new Error('Gmail not connected');

    // Get authenticated Gmail client
    const { oAuth2Client } = await getGmailAuthClient(credentials);
    
    // Initialize Gmail service
    const gmail = google.gmail({ version: 'v1', auth: oAuth2Client });

    try {
        console.log('readGmailEmails', params);
        
        // First, get the list of message IDs
        const listResponse = await gmail.users.messages.list({
            userId: 'me',
            q: params.query || 'in:inbox',
            maxResults: params.maxResults || 10,
            labelIds: params.labelIds
        });

        if (!listResponse.data.messages) {
            return [];
        }

        // Then, get the full message details for each message
        const messages = await Promise.all(
            listResponse.data.messages.map(async (message) => {
                const messageResponse = await gmail.users.messages.get({
                    userId: 'me',
                    id: message.id!,
                    format: 'full'
                });

                const messageData = messageResponse.data;
                const headers = messageData.payload?.headers || [];
                
                // Extract common headers
                const subject = headers.find(h => h.name === 'Subject')?.value || '';
                const from = headers.find(h => h.name === 'From')?.value || '';
                const to = headers.find(h => h.name === 'To')?.value || '';
                const date = headers.find(h => h.name === 'Date')?.value || '';

                // Extract body text
                let body = '';
                if (messageData.payload?.body?.data) {
                    body = Buffer.from(messageData.payload.body.data, 'base64').toString();
                } else if (messageData.payload?.parts) {
                    // Handle multipart messages
                    for (const part of messageData.payload.parts) {
                        if (part.mimeType === 'text/plain' && part.body?.data) {
                            body = Buffer.from(part.body.data, 'base64').toString();
                            break;
                        }
                    }
                }

                return {
                    id: messageData.id,
                    threadId: messageData.threadId,
                    subject,
                    from,
                    to,
                    date,
                    body: body.substring(0, 1000), // Limit body length
                    snippet: messageData.snippet,
                    labelIds: messageData.labelIds
                };
            })
        );

        return messages;
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