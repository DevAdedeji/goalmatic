import { getUserUid } from "../../index";
import { tool } from 'ai';
import { z } from 'zod';
import { goals_db } from '../../../init';
import { notifyUser } from '../../../helpers/emailNotifier';

const sendEmail = async (params: {
    subject: string;
    message: string;
}) => {
    const uid = getUserUid();
    
    if (!uid) {
        throw new Error('User authentication required');
    }

    // Get user's email address from their profile
    const userDoc = await goals_db.collection('users').doc(uid).get();
    
    if (!userDoc.exists) {
        throw new Error('User profile not found');
    }

    const userData = userDoc.data();
    const userEmail = userData?.email;

    if (!userEmail) {
        throw new Error('User email address not found');
    }

    try {
        // Send email to user's registered email address
        await notifyUser({
            to: [{ email: userEmail, name: userEmail }],
            from: { email: 'noreply@goalmatic.io', name: 'Goalmatic' },
            subject: params.subject,
            message_body: {
                type: 'text/plain',
                value: params.message
            }
        });

        return {
            success: true,
            message: 'Email sent successfully',
            recipient: userEmail,
            sentAt: new Date().toISOString()
        };
    } catch (error) {
        console.error('Error sending email:', error);
        throw new Error(`Failed to send email: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
};

const sendEmailTool = tool({
    description: "Sends an email to the user's registered email address. This is useful for notifications, reports, or important updates.",
    parameters: z.object({
        subject: z.string().describe("The email subject line"),
        message: z.string().describe("The email body content")
    }),
    execute: async (input: any) => {
        try {
            const result = await sendEmail(input);
            return result;
        } catch (error) {
            console.error('Email sending tool error:', error);
            throw error;
        }
    }
});

export const SEND_EMAIL_TOOL = {
    id: "SEND_EMAIL",
    tool: sendEmailTool,
};
