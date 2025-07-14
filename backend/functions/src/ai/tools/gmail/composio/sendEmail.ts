import { tool } from 'ai';
import { z } from 'zod';
import { getUserUid } from '../../../';
import { executeComposioGmailTool } from './index';

const sendComposioGmailEmail = async (params: {
    to: string;
    subject: string;
    body: string;
    isHtml?: boolean;
}) => {
    const uid = getUserUid();
    
    try {
        // Use Composio to send the email
        const result = await executeComposioGmailTool(
            'GMAIL_SEND_EMAIL',
            {
                to: params.to,
                subject: params.subject,
                body: params.body,
                is_html: params.isHtml || false,
            },
            uid
        );
        
        return {
            success: true,
            messageId: result.data?.id,
            result: result.data,
        };
    } catch (error) {
        console.error('Error sending Gmail email via Composio:', error);
        throw new Error(`Failed to send email via Composio: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
};

const sendComposioGmailEmailTool = tool({
    description: "Sends an email through Gmail using Composio integration",
    parameters: z.object({
        to: z.string().describe("Recipient email address"),
        subject: z.string().describe("Email subject line"),
        body: z.string().describe("Email body content"),
        isHtml: z.boolean().optional().describe("Whether the email body is HTML format"),
    }),
    execute: async (input: any) => {
        try {
            const result = await sendComposioGmailEmail(input);
            return result;
        } catch (error) {
            throw new Error(`Failed to send email: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
});

export const COMPOSIO_GMAIL_SEND_EMAIL = {
    id: "COMPOSIO_GMAIL_SEND_EMAIL",
    tool: sendComposioGmailEmailTool
}; 