import { getUserUid } from "../../index";
import { tool } from 'ai';
import { z } from 'zod';
import { goals_db } from '../../../init';
import { send_WA_Message, send_WA_ImageMessageInput } from '../../../whatsapp/utils/sendMessage';
import { goalmatic_whatsapp_workflow_template } from '../../../whatsapp/templates/workflow';
import { formatTemplateMessage } from '../../../whatsapp/utils/formatTemplateMessage';
import { normalizePhoneForWhatsApp } from '../../../utils/phoneUtils';
import { verifyWhatsAppAccess } from './verify';
import { v4 as uuidv4 } from 'uuid';

const sendWhatsAppMessage = async (params: {
    message: string;
    recipientType: 'user' | 'custom';
    phoneNumber?: string;
}) => {
    const uid = getUserUid();
    
    if (!uid) {
        throw new Error('User authentication required');
    }

    // Verify WhatsApp integration exists
    const { exists } = await verifyWhatsAppAccess(uid);
    if (!exists) {
        throw new Error('WhatsApp integration not found. Please connect your WhatsApp account first.');
    }

    let recipientNumber: string | null = null;

    if (params.recipientType === 'user') {
        // Get user's WhatsApp integration
        const userIntegrationsSnap = await goals_db
            .collection('users')
            .doc(uid)
            .collection('integrations')
            .where('provider', '==', 'WHATSAPP')
            .limit(1)
            .get();
            
        if (userIntegrationsSnap.empty) {
            throw new Error('No WhatsApp integration found. Please link your WhatsApp number first.');
        }
        
        const integrationPhone = userIntegrationsSnap.docs[0].data().phone;
        recipientNumber = normalizePhoneForWhatsApp(integrationPhone);
        
        if (!recipientNumber) {
            throw new Error('Invalid phone number in user integration');
        }
    } else if (params.recipientType === 'custom') {
        if (!params.phoneNumber) {
            throw new Error('Phone number is required for custom recipient');
        }
        
        recipientNumber = normalizePhoneForWhatsApp(params.phoneNumber);
        
        if (!recipientNumber) {
            throw new Error('Invalid phone number format');
        }
    } else {
        throw new Error('Invalid recipient type');
    }

    if (!recipientNumber) {
        throw new Error('Recipient phone number not found');
    }

    // Check if Customer Service Window is open (24-hour window for free-form messaging)
    const isCSWOpen = await isCustomerServiceWindowOpen(recipientNumber);

    try {
        if (isCSWOpen) {
            // Can send direct message during Customer Service Window
            const waMsg = send_WA_ImageMessageInput(recipientNumber, params.message);
            await send_WA_Message(waMsg);
            
            return {
                success: true,
                message: 'WhatsApp message sent successfully',
                recipient: recipientNumber,
                sentAt: new Date().toISOString(),
                deliveryMethod: 'direct'
            };
        } else {
            // Must use template message outside Customer Service Window
            const uniqueTemplateMessageId = uuidv4();
            const waMsg = goalmatic_whatsapp_workflow_template({
                message: formatTemplateMessage(params.message),
                recipientNumber: recipientNumber,
                uniqueTemplateMessageId: uniqueTemplateMessageId
            });
            
            // Save the non-formatted message for later retrieval
            await saveNonFormattedMessage(uniqueTemplateMessageId, recipientNumber, params.message);
            await send_WA_Message(waMsg);
            
            return {
                success: true,
                message: 'WhatsApp template message sent successfully',
                recipient: recipientNumber,
                sentAt: new Date().toISOString(),
                deliveryMethod: 'template',
                templateId: uniqueTemplateMessageId
            };
        }
    } catch (error) {
        console.error('Error sending WhatsApp message:', error);
        throw new Error(`Failed to send WhatsApp message: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
};

// Helper function to check if Customer Service Window is open
const isCustomerServiceWindowOpen = async (phoneNumber: string): Promise<boolean> => {
    const cswSnap = await goals_db.collection('CSW').doc(phoneNumber).get();
    if (!cswSnap.exists) return false;
    
    const cswData = cswSnap.data();
    const lastReceivedMessage = cswData?.lastReceivedMessage;
    
    if (!lastReceivedMessage) return false;
    
    const now = new Date();
    const timeSinceLastMessage = now.getTime() - new Date(lastReceivedMessage).getTime();
    
    // Customer Service Window is 24 hours (1000ms * 60s * 60m * 24h)
    return timeSinceLastMessage < 1000 * 60 * 60 * 24;
};

// Helper function to save non-formatted message for template messages
const saveNonFormattedMessage = async (uniqueTemplateMessageId: string, phoneNumber: string, message: string) => {
    await goals_db.collection('CSW').doc(phoneNumber).collection('nonFormattedMessages').doc(uniqueTemplateMessageId).set({
        message: message,
        createdAt: new Date().toISOString()
    });
};

const sendWhatsAppMessageTool = tool({
    description: "Sends a WhatsApp message to the user's linked WhatsApp number or a custom phone number. Automatically handles Customer Service Window restrictions and template message requirements.",
    parameters: z.object({
        message: z.string().describe("The message content to send via WhatsApp"),
        recipientType: z.enum(['user', 'custom']).describe("Send to user's linked WhatsApp ('user') or a custom phone number ('custom')"),
        phoneNumber: z.string().optional().describe("Phone number with country code (required when recipientType is 'custom'). Format: +1234567890")
    }),
    execute: async (input: any) => {
        try {
            const result = await sendWhatsAppMessage(input);
            return result;
        } catch (error) {
            console.error('WhatsApp message tool error:', error);
            throw error;
        }
    }
});

export const SEND_WHATSAPP_MESSAGE_TOOL = {
    id: "SEND_WHATSAPP_MESSAGE",
    tool: sendWhatsAppMessageTool,
};
