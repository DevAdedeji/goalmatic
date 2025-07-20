import { google } from 'googleapis';
import { verifyGmailAccess } from "./verify";
import { getUserUid } from "../../index";
import { getGmailAuthClient } from './utils/tokenManager';
import { executeComposioGmailTool } from './composio/index';
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
    if (!exists) throw new Error('Gmail not connected. Please connect your Gmail account first.');

    // Check if this is a Composio integration
    if (credentials.provider === 'COMPOSIO') {
        console.log('Using Composio Gmail integration');
        try {
            const result = await executeComposioGmailTool(
                'GMAIL_SEND_EMAIL',
                {
                    recipient_email: params.to,
                    subject: params.subject,
                    body: params.body,
                    is_html: params.isHtml || false,
                },
                uid
            );
            
            return {
                success: true,
                messageId: result.data?.id,
                details: {
                    to: params.to,
                    subject: params.subject,
                    sentAt: new Date().toISOString(),
                    provider: 'COMPOSIO'
                }
            };
        } catch (error: any) {
            console.error('Failed to send Gmail email via Composio:', error);
            throw new Error(`Failed to send email via Composio: ${error.message}`);
        }
    }

    // Use direct Google OAuth integration
    console.log('Using direct Google OAuth Gmail integration');
    
    // Get authenticated Gmail client
    const { oAuth2Client } = await getGmailAuthClient(credentials);
    
    // Initialize Gmail service
    const gmail = google.gmail({ version: 'v1', auth: oAuth2Client });

    try {
        // Create the email content
        const emailLines = [
            `To: ${params.to}`,
            `Subject: ${params.subject}`,
            '',
            params.body
        ];

        const email = emailLines.join('\n');
        const encodedEmail = Buffer.from(email).toString('base64url');

        // Send the email
        const response = await gmail.users.messages.send({
            userId: 'me',
            requestBody: {
                raw: encodedEmail
            }
        });

        console.log('Gmail email sent successfully:', response.data);
        return {
            success: true,
            messageId: response.data.id,
            details: {
                to: params.to,
                subject: params.subject,
                sentAt: new Date().toISOString(),
                provider: 'GOOGLE'
            }
        };
    } catch (error: any) {
        console.error('Failed to send Gmail email:', error);
        throw new Error(`Failed to send email: ${error.message}`);
    }
};

export const sendGmailEmailTool = tool({
    description: 'Send an email using Gmail (supports both Composio and direct OAuth)',
    parameters: z.object({
        to: z.string().describe('Recipient email address'),
        subject: z.string().describe('Email subject'),
        body: z.string().describe('Email body content'),
        isHtml: z.boolean().optional().describe('Whether the body is HTML')
    }),
    execute: sendGmailEmail
});
