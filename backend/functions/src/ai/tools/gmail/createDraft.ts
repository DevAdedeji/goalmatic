import { getUserUid } from "../../index";
import { tool } from 'ai';
import { z } from 'zod';
// @ts-ignore
import { Composio } from '@composio/core';
import { is_dev } from '../../../init';
import { goals_db } from '../../../init'

const COMPOSIO_API_KEY = is_dev ? process.env.COMPOSIO_API_KEY_DEV : process.env.COMPOSIO_API_KEY_PROD;

const createGmailDraft = async (params: {
    to: string;
    subject: string;
    body: string;
    isHtml?: boolean;
}) => {
    const uid = getUserUid();
    const composio = new Composio({ apiKey: COMPOSIO_API_KEY });

    const allIntegrations = await goals_db.collection('users')
        .doc(uid)
        .collection('integrations').where('type', '==', 'EMAIL').where('provider', '==', 'GOOGLE_COMPOSIO').get()

    const composioIntegration = allIntegrations.docs[0].data()
    const connectionId = composioIntegration.connection_id

    console.log('composioIntegration', composioIntegration);

    try {
        const { data } = await composio.tools.execute('GMAIL_CREATE_EMAIL_DRAFT', {
            userId: uid,
            connectedAccountId: connectionId,
            arguments: {
                recipient_email: params.to,
                subject: params.subject,
                body: params.body,
                is_html: params.isHtml || false,
            }
        }) as any;

        return data;
    } catch (error) {
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