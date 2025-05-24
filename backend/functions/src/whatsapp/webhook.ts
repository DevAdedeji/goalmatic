import { onRequest } from 'firebase-functions/v2/https'
import { get_WA_TextMessageInput, send_WA_Message, sendWAReadAndTypingIndicator } from './utils/sendMessage'
import { WhatsappAgent } from './utils/WhatsappAgent'
import { setWhatsAppPhone } from '../ai'
import {
    handleGetRequest,
    parseWebhookEvent,
    shouldSkipMessageForDevProd,
    getUserDetailsAndAgent,
    processMessageContent,
    processCommand,
    handleButtonClick,
    checkUnsupportedMessageTypes,
    logCustomerServiceWindow
} from './webhookHelpers'

export const goals_WA_message_webhook = onRequest({
    cors: true,
    region: 'us-central1'
}, async (req: any, res: any) => {
    if (req.method === 'GET') {
        handleGetRequest(req, res);
        return;
    }

    if (req.method === 'POST') {
        try {
            const { message, phone_number_id, from } = parseWebhookEvent(req);

            if (!message) {
                console.log("Webhook received non-message event or malformed body:", JSON.stringify(req.body));
                res.sendStatus(200);
                return;
            }

            setWhatsAppPhone(from);
            logCustomerServiceWindow(from);

            const skipCheck = shouldSkipMessageForDevProd(from);
            if (skipCheck.shouldSkip) {
                console.log(skipCheck.reason);
                res.sendStatus(200);
                return;
            }

            // Handle commands first (text messages starting with /)
            if (message.type === 'text') {
                const textBody = message.text.body.trim();
                const commandResult = await processCommand(textBody, from, phone_number_id);
                if (commandResult.handled && commandResult.shouldReturn) {
                    res.sendStatus(200);
                    return;
                }
            }

            // Send read and typing indicators
            try { 
                await sendWAReadAndTypingIndicator(phone_number_id, message.id); 
            } catch(err){ 
                console.error('Error sending read/typing:', err); 
            }

            // Check for unsupported message types
            const unsupportedCheck = await checkUnsupportedMessageTypes(message, from, phone_number_id);
            if (unsupportedCheck.isUnsupported) {
                res.sendStatus(200);
                return;
            }

            // Handle button clicks
            const buttonResult = await handleButtonClick(message, from, phone_number_id);
            if (buttonResult.handled) {
                res.sendStatus(200);
                return;
            }

            // Get user details and agent configuration
            const { userDetails, agentData, error } = await getUserDetailsAndAgent(from);
            if (error) {
                const data = get_WA_TextMessageInput(from, error);
                await send_WA_Message(data, phone_number_id);
                res.sendStatus(200);
                return;
            }

            if (!userDetails || !userDetails.user_id) {
                console.error("CRITICAL: user_id missing before calling WhatsappAgent for user:", from);
                const errData = get_WA_TextMessageInput(from, "Sorry, there was a problem identifying your account. Please try again.");
                await send_WA_Message(errData, phone_number_id);
                res.sendStatus(500);
                return;
            }

            // Process message content based on type
            const { msg_body_for_agent, messageTypeForAgent } = await processMessageContent(
                message, 
                from, 
                phone_number_id, 
                agentData!
            );

            // Get AI response and send it - pass the original message for potential media storage
            const gpt_response = await WhatsappAgent(userDetails, msg_body_for_agent, agentData!, messageTypeForAgent, undefined, message);
            const responseData = get_WA_TextMessageInput(from, gpt_response.msg);
            await send_WA_Message(responseData, phone_number_id);
            
            res.sendStatus(200);

        } catch (e: any) {
            console.error('Error in webhook POST processing:', e.message, e.stack);
            res.sendStatus(500); 
        }
    } else {
        res.sendStatus(405);
    }
})