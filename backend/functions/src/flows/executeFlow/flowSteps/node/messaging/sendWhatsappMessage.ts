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

// Final-pass resolver to ensure plain-text tokens like @step-1-TABLE_CREATE-totalRecordsCreated are resolved
const resolvePlainTextMentions = (text: string, previousStepResult: any): string => {
    if (!text || typeof text !== 'string') return text;
    return text.replace(/@(step|trigger)-([\w-]+)-([\w]+)/g, (_match, prefix, groupRest, payloadKey) => {
        const stepId = `${prefix}-${groupRest}`;
        let replacementValue = previousStepResult?.[stepId]?.payload?.[payloadKey];
        if (replacementValue === undefined && previousStepResult) {
            const nodeIdSuffix = groupRest.replace(/^\d+-/, '');
            for (const key in previousStepResult) {
                if (typeof key === 'string' && key.endsWith(`-${nodeIdSuffix}`)) {
                    const candidate = previousStepResult[key]?.payload?.[payloadKey];
                    if (candidate !== undefined) {
                        replacementValue = candidate;
                        break;
                    }
                }
            }
        }
        return replacementValue !== undefined ? String(replacementValue) : '';
    });
}

const sendWhatsappMessage = async (context: WorkflowContext, step: FlowNode, previousStepResult: any) => {
    try {

        const processedProps = processMentionsProps(step.propsData, previousStepResult);


        const { processedPropsWithAiContext } = await generateAiFlowContext(step, processedProps);

        let { message, recipientType, phoneNumber } = processedPropsWithAiContext;
        // Ensure message is a string so that numeric 0 is preserved
        message = message === null || message === undefined ? '' : String(message);
        // Final safeguard: resolve any remaining plain-text tokens
        message = resolvePlainTextMentions(message, previousStepResult);


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
        console.error(error);
        return { success: false, error: error?.message || error };
    }
};

export const sendWhatsappMessageNode = {
    nodeId: 'SEND_WHATSAPP_MESSAGE',
    run: sendWhatsappMessage
};

const isCustomerServiceWindowOpen = async (phoneNumber: string) => {
    // In dev or when running the Firebase emulator, always allow sending
    // if (is_emulator) return true;
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