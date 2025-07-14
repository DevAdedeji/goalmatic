import { tool } from 'ai';
import { z } from 'zod';
import { getUserUid } from '../../../';
import { executeComposioGmailTool } from './index';

const readComposioGmailEmails = async (params: {
    query?: string;
    maxResults?: number;
    labelIds?: string[];
}) => {
    const uid = getUserUid();
    
    try {
        // Use Composio to fetch emails
        const result = await executeComposioGmailTool(
            'GMAIL_FETCH_EMAILS',
            {
                query: params.query || 'in:inbox',
                max_results: params.maxResults || 10,
                label_ids: params.labelIds || [],
            },
            uid
        );
        
        return {
            success: true,
            emails: result.data?.emails || [],
            result: result.data,
        };
    } catch (error) {
        console.error('Error reading Gmail emails via Composio:', error);
        throw new Error(`Failed to read emails via Composio: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
};

const readComposioGmailEmailsTool = tool({
    description: "Reads emails from Gmail using Composio integration",
    parameters: z.object({
        query: z.string().optional().describe("Gmail search query (e.g., 'from:example@gmail.com', 'is:unread')"),
        maxResults: z.number().optional().describe("Maximum number of emails to retrieve (default: 10)"),
        labelIds: z.array(z.string()).optional().describe("Label IDs to filter emails"),
    }),
    execute: async (input: any) => {
        try {
            const result = await readComposioGmailEmails(input);
            return result;
        } catch (error) {
            throw new Error(`Failed to read emails: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
});

export const COMPOSIO_GMAIL_READ_EMAILS = {
    id: "COMPOSIO_GMAIL_READ_EMAILS",
    tool: readComposioGmailEmailsTool
}; 