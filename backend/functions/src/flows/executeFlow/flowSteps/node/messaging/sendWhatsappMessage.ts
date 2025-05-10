import { WorkflowContext } from "@upstash/workflow";
import { FlowNode } from "../../../type";
import { goals_db } from "../../../../../init";
import {  send_WA_Message } from "../../../../../whatsapp/utils/sendMessage";
import { goalmatic_whatsapp_workflow_template } from "../../../../../whatsapp/templates/workflow";
import { formatTemplateMessage } from "../../../../../whatsapp/utils/formatTemplateMessage";


const sendWhatsappMessage = async (context: WorkflowContext, step: FlowNode, previousStepResult: any) => {
    try {

        const { message, recipientType, phoneNumber } = step.propsData;

        let recipientNumber = null;

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
            recipientNumber = userIntegrationsSnap.docs[0].data().phone;
        } else if (recipientType === 'custom') {
            if (!phoneNumber) throw new Error('Phone number is required');
            recipientNumber = phoneNumber.toString().replace('+', '').trim();
        } else {
            throw new Error('Invalid recipient type');
        }



        if (!recipientNumber) throw new Error('Recipient phone number not found');

        
        const waMsg = goalmatic_whatsapp_workflow_template({
            message: formatTemplateMessage(message),
            recipientNumber: recipientNumber
        });

        await send_WA_Message(waMsg);
        return { success: true, sentAt: new Date().toISOString() };
    } catch (error: any) {
        console.error(error.response?.data);
        return { success: false, error: error?.message || error };
    }
};

export const sendWhatsappMessageNode = {
    nodeId: 'SEND_WHATSAPP_MESSAGE',
    run: sendWhatsappMessage
}; 