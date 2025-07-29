import { WorkflowContext } from "@upstash/workflow";
import { FlowNode } from "../../../type";
import { goals_db } from "../../../../../init";
import { send_WA_Message, send_WA_ImageMessageInput } from "../../../../../whatsapp/utils/sendMessage";
import { goalmatic_whatsapp_workflow_template } from "../../../../../whatsapp/templates/workflow";
import { formatTemplateMessage } from "../../../../../whatsapp/utils/formatTemplateMessage";
import { v4 as uuidv4 } from 'uuid';
import { processMentionsProps } from "../../../../../utils/processMentions";
import { generateAiFlowContext } from "../../../../../utils/generateAiFlowContext";
import { normalizePhoneForWhatsApp } from "../../../../../utils/phoneUtils";

const sendWhatsappMessage = async (context: WorkflowContext, step: FlowNode, previousStepResult: any) => {
    try {
        
        const processedProps = processMentionsProps(step.propsData, previousStepResult);
        
        const { processedPropsWithAiContext } = await generateAiFlowContext(step, processedProps);

        let { message, recipientType, phoneNumber } = processedPropsWithAiContext;

        let recipientNumber: string | null = null;

        if (recipientType === 'user') {
            // Get user ID from context.requestPayload
            const { userId } = context.requestPayload as { userId: string };
            if (!userId) throw new Error('User ID not found in context');
            // Fetch user WhatsApp integration
            const userIntegrationsSnap = await goals_db
                .collection('users')
                .doc(userId)
                .collection('integrations')
                .where('provider', '==', 'WHATSAPP')
                .limit(1)
                .get();
            if (userIntegrationsSnap.empty) throw new Error('No WhatsApp integration found for user');
            // Integration phone numbers should already be normalized after migration
            const integrationPhone = userIntegrationsSnap.docs[0].data().phone;
            recipientNumber = normalizePhoneForWhatsApp(integrationPhone);
            if (!recipientNumber) throw new Error('Invalid phone number in user integration');
        } else if (recipientType === 'custom') {
            if (!phoneNumber) throw new Error('Phone number is required');
            recipientNumber = normalizePhoneForWhatsApp(phoneNumber);
            if (!recipientNumber) throw new Error('Invalid phone number format');
        } else {
            throw new Error('Invalid recipient type');
        }

        if (!recipientNumber) throw new Error('Recipient phone number not found');

        const isCSWOpen = await isCustomerServiceWindowOpen(recipientNumber);


        if (isCSWOpen) {
            const waMsg = send_WA_ImageMessageInput(recipientNumber, message);
            await send_WA_Message(waMsg);
        } else {
            const uniqueTemplateMessageId = uuidv4();
            const waMsg = goalmatic_whatsapp_workflow_template({
                message: formatTemplateMessage(message),
                recipientNumber: recipientNumber,
                uniqueTemplateMessageId: uniqueTemplateMessageId
            });
            await saveNonFormattedMessage(uniqueTemplateMessageId, recipientNumber, message);
            await send_WA_Message(waMsg);

        }

        return { 
            success: true, 
            sentAt: new Date().toISOString(), 
            payload: processedPropsWithAiContext // Return updated props so subsequent nodes get processed values
        };
    } catch (error: any) {
        console.error(error.response?.data);
        return { success: false, error: error?.message || error };
    }
};

export const sendWhatsappMessageNode = {
    nodeId: 'SEND_WHATSAPP_MESSAGE',
    run: sendWhatsappMessage
};

const isCustomerServiceWindowOpen = async (phoneNumber: string) => {
    const cswSnap = await goals_db.collection('CSW').doc(phoneNumber).get();
    if (!cswSnap.exists) return false;
    const cswData = cswSnap.data();
    const lastReceivedMessage = cswData?.lastReceivedMessage;

    const now = new Date();
    const timeSinceLastMessage = now.getTime() - new Date(lastReceivedMessage).getTime();
    return timeSinceLastMessage < 1000 * 60 * 60 * 24;
}

const saveNonFormattedMessage = async (uniqueTemplateMessageId: string, phoneNumber: string, message: string) => {
    await goals_db.collection('CSW').doc(phoneNumber).collection('nonFormattedMessages').doc(uniqueTemplateMessageId).set({
        message: message,
        createdAt: new Date().toISOString()
    });
}