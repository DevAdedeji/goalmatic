import { onRequest } from 'firebase-functions/v2/https'

import { getDetailsByPhone } from './utils/getDetailsByPhone'
import { get_WA_TextMessageInput, send_WA_ImageMessageInput, send_WA_Message, sendWAReadAndTypingIndicator } from './utils/sendMessage'
import { WhatsappAgent, defaultGoalmaticAgent } from './utils/WhatsappAgent'
import { is_dev, goals_db } from '../init'
import { transcribeWhatsAppAudio } from './utils/transcribeAudio'
import { processWhatsAppImage } from './utils/processImage'
import { setWhatsAppPhone } from '../ai'




export const goals_WA_message_webhook = onRequest({
    cors: true,
    region: 'us-central1'
}, async (req: any, res: any) => {
    if (req.method === 'GET') {
        if (
            req.query['hub.mode'] == 'subscribe' &&
            req.query['hub.verify_token'] == (is_dev ? 'goalmatic-dev' : 'goalmatic-prod')
        ) {
            res.send(req.query['hub.challenge'])
        } else {
            res.sendStatus(400)
        }
    }

    if (req.method === 'POST') {
        try {
            if (req.body.object) {
                if (
                    req.body.entry &&
                    req.body.entry[0].changes &&
                    req.body.entry[0].changes[0] &&
                    req.body.entry[0].changes[0].value.messages &&
                    req.body.entry[0].changes[0].value.messages[0]
                ) {
                    const phone_number_id = req.body.entry[0].changes[0].value.metadata.phone_number_id
                    const from = req.body.entry[0].changes[0].value.messages[0].from
                    const message = req.body.entry[0].changes[0].value.messages[0]


                    setWhatsAppPhone(from);
                    logCustomerServiceWindow(from);

                    // In development, only respond to the dev test number
                    if (is_dev && from !== '2348106814815') {
                        return res.sendStatus(200)
                    }
                    if (!is_dev && from === '2348106814815') {
                        return res.sendStatus(200)
                    }

                    // Check for unsupported message types
                    if (message.type === 'document' || message.type === 'video' || message.type === 'sticker' || message.type === 'location' || message.type === 'contacts' || message.type === 'unsupported') {
                        const errorMsg = 'Sorry, some media messages (documents, videos, stickers, location, contacts) are not supported. Please send text messages, images, or voice notes.'
                        const data = get_WA_TextMessageInput(from, errorMsg)
                        await send_WA_Message(data, phone_number_id)
                        res.sendStatus(200)
                        return
                    }

                    // Handle button type messages with specific text
                    if (message.type === 'button' && message.button && message.button.text === 'Get Formatted Message') {
                        const payloadId = message.button.payload;
                        const cswSnap = await goals_db.collection('CSW').doc(from).collection('nonFormattedMessages').doc(payloadId).get();
                        const payloadMsg = cswSnap.data()?.message || 'No message found';
                        const data = send_WA_ImageMessageInput(from, payloadMsg);
                        await send_WA_Message(data, phone_number_id);
                        res.sendStatus(200);
                        return;
                    }

                    // Mark as read and show typing indicator for supported message types
                    try {
                        await sendWAReadAndTypingIndicator(phone_number_id, message.id);
                    } catch (err) {
                        console.error('Failed to send mark as read/typing indicator:', err);
                    }

                    // 2348106814815



                    const user_data = await getDetailsByPhone(from)!

                    if (user_data.status === 404) {
                        const data = get_WA_TextMessageInput(from, 'User not found!, Please register on https://www.goalmatic.io \n\n If you have already registered, ensure you have linked your account to your phone number')
                        await send_WA_Message(data, phone_number_id)
                        res.sendStatus(200)
                        return
                    } else if (user_data.status === 500) {
                        const data = get_WA_TextMessageInput(from, `Something went wrong, Please try again later: ${user_data.data}`)
                        await send_WA_Message(data, phone_number_id)
                        res.sendStatus(500)
                        return
                    } else {

                        // Process message based on type
                        let msg_body: string | { isImage: boolean, buffer: Buffer, contentType: string } | { role: string, content: string } | { type: string, mimeType?: string, data?: Buffer, text?: string }[] = ''
                        let messageType = 'text'; // Track the original message type
                        
                        if (message.type === 'text') {
                            msg_body = message.text.body
                            messageType = 'text';
                        } else if (message.type === 'audio') {
                            // Process audio message by transcribing it into text
                            const transcription = await transcribeWhatsAppAudio(message.audio.id, from, phone_number_id)
                            msg_body = transcription;
                            messageType = 'audio';
                        }

                        // Get agent data based on user configuration
                        let agentData: Record<string, any>;
                        const userData = user_data.data || {};
                        // Use type assertion to avoid TypeScript error
                        const userConfig = (userData as any).config;
                        const agentId = userConfig?.selected_agent_id;
                        if (!agentId) {
                            agentData = defaultGoalmaticAgent;
                        } else {
                            const agent = await goals_db.collection('agents').doc(agentId).get();
                            agentData = agent.data() as Record<string, any>;
                        }

                        try {
                            // Process image after getting agent data so we can pass it to the image processor
                            if (message.type === 'image') {
                                // Extract caption text if present
                                const imageCaption = message.image.caption || '';
                                
                                // Process image message, getting the buffer to pass directly to the WhatsApp agent
                                msg_body = await processWhatsAppImage(message.image.id, from, phone_number_id, agentData, imageCaption)
                                messageType = 'image';
                            }

                            const gpt_response = await WhatsappAgent(user_data.data!, msg_body, agentData, messageType)
                            const data = get_WA_TextMessageInput(from, gpt_response.msg)
                            await send_WA_Message(data, phone_number_id)
                        } catch (error) {
                            console.error('Error processing message:', error);
                            // Send a generic error message to the user
                            const errorMsg = get_WA_TextMessageInput(from, 'Sorry, there was an error processing your message. Please try again later.')
                            await send_WA_Message(errorMsg, phone_number_id)
                        }
                    }


                    res.sendStatus(200)
                } else {
                    res.sendStatus(200)
                }
            } else {
                res.sendStatus(404)
            }
        } catch (e) {
            res.sendStatus(404)
        }
    }
})


const logCustomerServiceWindow = (phoneNumber: string) => {
    goals_db.collection('CSW').doc(phoneNumber).set({
        phoneNumber,
        lastReceivedMessage: new Date().toISOString()
    }, { merge: true })
}