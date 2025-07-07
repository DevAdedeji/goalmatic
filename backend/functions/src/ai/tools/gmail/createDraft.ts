import { google } from 'googleapis';
import { verifyGmailAccess } from "./verify";
import { getUserUid } from "../../index";
import { getGmailAuthClient } from './utils/tokenManager';
import { tool } from 'ai';
import { z } from 'zod';

const createGmailDraft = async (params: {
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

        console.log('createGmailDraft', { to: params.to, subject: params.subject });
        const response = await gmail.users.drafts.create({
            userId: 'me',
            requestBody: {
                message: {
                    raw: encodedEmail
                }
            }
        });

        return response.data;
    } catch (error) {
        console.error('Error creating Gmail draft:', error);
        throw new Error('Failed to create draft');
    }
};

const createGmailDraftTool = tool({
    description: "Creates a draft email in the user's Gmail account",
    parameters: z.object({
        to: z.string().describe("Recipient email address"),
        subject: z.string().describe("Email subject line"),
        body: z.string().describe("Email body content"),
        isHtml: z.boolean().optional().describe("Whether the email body is HTML format"),
    }),
    execute: async (input: any) => {
        try {
            const result = await createGmailDraft(input);
            return result;
        } catch (error) {
            throw new Error('Failed to create draft');
        }
    }
});

export const GMAIL_CREATE_DRAFT = {
    id: "GMAIL_CREATE_DRAFT",
    tool: createGmailDraftTool
}; 