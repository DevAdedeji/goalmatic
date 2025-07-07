import { google } from 'googleapis';
import { verifyGmailAccess } from "./verify";
import { getUserUid } from "../../index";
import { getGmailAuthClient } from './utils/tokenManager';
import { tool } from 'ai';
import { z } from 'zod';

const sendGmailEmail = async (params: {
    to: string;
    subject: string;
    body: string;
    isHtml?: boolean;
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
        // Create the email content
        const emailLines = [
            `To: ${params.to}`,
            `Subject: ${params.subject}`,
            `Content-Type: ${params.isHtml ? 'text/html' : 'text/plain'}; charset=utf-8`,
            '',
            params.body
        ];

        const email = emailLines.join('\r\n');
        const encodedEmail = Buffer.from(email).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

        console.log('sendGmailEmail', { to: params.to, subject: params.subject });
        const response = await gmail.users.messages.send({
            userId: 'me',
            requestBody: {
                raw: encodedEmail
            }
        });

        return response.data;
    } catch (error) {
        console.error('Error sending Gmail email:', error);
        throw new Error('Failed to send email');
    }
};

const sendGmailEmailTool = tool({
    description: "Sends an email through the user's Gmail account",
    parameters: z.object({
        to: z.string().describe("Recipient email address"),
        subject: z.string().describe("Email subject line"),
        body: z.string().describe("Email body content"),
        isHtml: z.boolean().optional().describe("Whether the email body is HTML format"),
    }),
    execute: async (input: any) => {
        try {
            const result = await sendGmailEmail(input);
            return result;
        } catch (error) {
            throw new Error('Failed to send email');
        }
    }
});

export const GMAIL_SEND_EMAIL = {
    id: "GMAIL_SEND_EMAIL",
    tool: sendGmailEmailTool
}; 