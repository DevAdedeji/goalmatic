import { onRequest } from 'firebase-functions/v2/https'
import { get_WA_TextMessageInput, send_WA_Message, sendWAReadAndTypingIndicator } from './utils/sendMessage'
import { WhatsappAgent } from './utils/WhatsappAgent'
import { setWhatsAppPhone } from '../ai'
import { goalmatic_whatsapp_signup_flow_template } from './templates/signup'
import {
    handleGetRequest,
    parseWebhookEvent,
    shouldSkipMessageForDevProd,
    getUserDetailsAndAgent,
    processMessageContent,
    processCommand,
    handleButtonClick,
    checkUnsupportedMessageTypes,
    logCustomerServiceWindow,
    isDuplicateMessage
} from './webhookHelpers'

export const goals_WA_message_webhook = onRequest({
    cors: true,
    region: 'us-central1'
}, async (req: any, res: any) => {
    if (req.method === 'GET') {
        handleGetRequest(req, res);
        return;
    }
    console.log('req.body', JSON.stringify(req.body, null, 2));

    if (req.method === 'POST') {
        try {
            const { message, phone_number_id, from, contactName, status, webhookType } = parseWebhookEvent(req);

            console.log('message', message);
            console.log('phone_number_id', phone_number_id);
            console.log('from', from);
            console.log('contactName', contactName);
            console.log('status', status);
            console.log('webhookType', webhookType);

            // Handle status webhooks (delivery receipts, read receipts, etc.)
            if (webhookType === 'status') {
                console.log("Received status webhook:", JSON.stringify(status, null, 2));
                console.log(`Status update for recipient ${from}: ${status.status}`);
                res.sendStatus(200);
                return;
            }

            if (!message) {
                console.log("Webhook received non-message event or malformed body:", JSON.stringify(req.body));
                res.sendStatus(200);
                return;
            }

            // Check for duplicate messages early to prevent reprocessing
            if (message.id && await isDuplicateMessage(message.id)) {
                console.log(`Duplicate message ${message.id} from ${from} - skipping processing`);
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
            if (error && error.status === 404) {
                const signup_flow_template = goalmatic_whatsapp_signup_flow_template({
                    username: contactName || 'User',
                    recipientNumber: from,
                });

                console.log('Sending signup flow template:', signup_flow_template);
                try {
                await send_WA_Message(signup_flow_template);
                    console.log('Signup flow template sent successfully');
                } catch (sendError: any) {
                    console.error('Error sending signup flow template:');
                    console.error('Status:', sendError.response?.status);
                    console.error('Status text:', sendError.response?.statusText);
                    console.error('Response data:', JSON.stringify(sendError.response?.data, null, 2));
                    console.error('Request config:', JSON.stringify(sendError.config, null, 2));
                    console.error('Full error:', sendError.message);
                    throw sendError; // Re-throw to be caught by outer catch
                }
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

            // Check if we should skip AI response (e.g., for certain flow completions)
            if (msg_body_for_agent === "__SKIP_AI_RESPONSE__" || msg_body_for_agent === "__SKIP_AI_RESPONSE_SIGNUP__") {
                const responseData = get_WA_TextMessageInput(from, "What can I help you with today?");
                await send_WA_Message(responseData, phone_number_id);
                res.sendStatus(200);
                return;
            }

            // Get AI response and send it - pass the original message for potential media storage
            const gpt_response = await WhatsappAgent(userDetails, msg_body_for_agent, agentData!, messageTypeForAgent, undefined, message);
            const responseData = get_WA_TextMessageInput(from, gpt_response.msg);
            
            console.log('Sending AI response message:', responseData);
            try {
            await send_WA_Message(responseData, phone_number_id);
                console.log('AI response message sent successfully');
            } catch (sendError: any) {
                console.error('Error sending AI response message:');
                console.error('Status:', sendError.response?.status);
                console.error('Status text:', sendError.response?.statusText);
                console.error('Response data:', JSON.stringify(sendError.response?.data, null, 2));
                console.error('Request config:', JSON.stringify(sendError.config, null, 2));
                console.error('Full error:', sendError.message);
                throw sendError; // Re-throw to be caught by outer catch
            }
            
            res.sendStatus(200);

        } catch (e: any) {
            console.error('Error in webhook POST processing:', e.message);
            console.error('Error stack:', e.stack);
            
            // If it's an Axios error, log additional details
            if (e.response) {
                console.error('HTTP Error Details:');
                console.error('Status:', e.response.status);
                console.error('Status Text:', e.response.statusText);
                console.error('Response Headers:', JSON.stringify(e.response.headers, null, 2));
                console.error('Response Data:', JSON.stringify(e.response.data, null, 2));
            }
            
            if (e.request) {
                console.error('Request Details:');
                console.error('Request URL:', e.config?.url);
                console.error('Request Method:', e.config?.method);
                console.error('Request Headers:', JSON.stringify(e.config?.headers, null, 2));
                console.error('Request Data:', JSON.stringify(e.config?.data, null, 2));
            }
            
            res.sendStatus(500); 
        }
    } else {
        res.sendStatus(405);
    }
})