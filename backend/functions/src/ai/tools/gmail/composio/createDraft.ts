import { tool } from 'ai';
import { z } from 'zod';
import { getUserUid } from '../../../';
import { executeComposioGmailTool } from './index';

const createComposioGmailDraft = async (params: {
    to: string;
    subject: string;
    body: string;
    isHtml?: boolean;
}) => {
    const uid = getUserUid();
    
    try {
        // Use Composio to create a draft
        const result = await executeComposioGmailTool(
            'GMAIL_CREATE_DRAFT',
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
            draftId: result.data?.id,
            result: result.data,
        };
    } catch (error) {
        console.error('Error creating Gmail draft via Composio:', error);
        throw new Error(`Failed to create draft via Composio: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
};

const createComposioGmailDraftTool = tool({
    description: "Creates a draft email in Gmail using Composio integration",
    parameters: z.object({
        to: z.string().describe("Recipient email address"),
        subject: z.string().describe("Email subject line"),
        body: z.string().describe("Email body content"),
        isHtml: z.boolean().optional().describe("Whether the email body is HTML format"),
    }),
    execute: async (input: any) => {
        try {
            const result = await createComposioGmailDraft(input);
            return result;
        } catch (error) {
            throw new Error(`Failed to create draft: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
});

export const COMPOSIO_GMAIL_CREATE_DRAFT = {
    id: "COMPOSIO_GMAIL_CREATE_DRAFT",
    tool: createComposioGmailDraftTool
}; 