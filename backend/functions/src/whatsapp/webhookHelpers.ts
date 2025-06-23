import { getDetailsByPhone } from './utils/getDetailsByPhone'
import { get_WA_TextMessageInput, send_WA_ImageMessageInput, send_WA_Message } from './utils/sendMessage'
import { WhatsappAgent, defaultGoalmaticAgent } from './utils/WhatsappAgent'
import { is_dev, goals_db } from '../init'
import { transcribeWhatsAppAudio } from './utils/transcribeAudio'
import { processWhatsAppImage } from './utils/processImage'
import { Timestamp } from 'firebase-admin/firestore'

// Helper function to handle GET requests for webhook verification
export const handleGetRequest = (req: any, res: any): boolean => {
    if (
        req.query['hub.mode'] == 'subscribe' &&
        req.query['hub.verify_token'] == (is_dev ? 'goalmatic-dev' : 'goalmatic-prod')
    ) {
        res.send(req.query['hub.challenge'])
    } else {
        res.sendStatus(400)
    }
    return true;
}

// Helper function to parse webhook event data
export const parseWebhookEvent = (req: any) => {
    const entry = req.body.entry && req.body.entry[0];
    const changes = entry && entry.changes && entry.changes[0];
    const value = changes && changes.value;
    const message = value && value.messages && value.messages[0];
    const phone_number_id = value?.metadata?.phone_number_id;
    const from = message?.from;

    return { message, phone_number_id, from };
}

// Helper function to check if message should be skipped based on environment
export const shouldSkipMessageForDevProd = (from: string): { shouldSkip: boolean; reason?: string } => {
    const devNumbers = (process.env.DEV_WHATSAPP_NUMBERS || '').split(',');
    const isDevNumber = devNumbers.includes(from);
    
    if (is_dev && !isDevNumber) {
        return { shouldSkip: true, reason: `Dev mode: Skipping message from non-dev number: ${from}` };
    }
    if (!is_dev && isDevNumber) {
        return { shouldSkip: true, reason: `Prod mode: Skipping message from dev number: ${from}` };
    }
    return { shouldSkip: false };
}

// Helper function to get user details and agent configuration
export const getUserDetailsAndAgent = async (from: string) => {
    let userDetailsForAgent = { user_id: from, raw_phone: from } as { user_id: string;[key: string]: any };

    try {
        const db_user_details = await getDetailsByPhone(from);
        if (db_user_details.status === 200 && db_user_details.data) {
            const dataFromDb = db_user_details.data as { user_id?: string;[key: string]: any };
            userDetailsForAgent = {
                ...userDetailsForAgent,
                ...dataFromDb,
                user_id: dataFromDb.user_id || userDetailsForAgent.user_id
            };
        } else if (db_user_details.status === 404) {
            return {
                error: {
                    message: 'User not found! Please register on https://www.goalmatic.io to use our services.\n\nIf you have registered, ensure your WhatsApp number is linked correctly.',
                    status: 404
                },
                userDetails: null,
                agentData: null
            };
        } else {
            console.warn(`Could not get full user details for ${from}, status: ${db_user_details.status}. Proceeding with basic ID.`);
        }
    } catch (dbError) {
        console.error(`Error fetching user details for ${from}:`, dbError);
    }

    // Get agent configuration
    let agentDataToUse: Record<string, any>;
    const userConfig = (userDetailsForAgent as any).config;
    const agentId = userConfig?.selected_agent_id;

    if (!agentId) {
        agentDataToUse = defaultGoalmaticAgent;
    } else {
        const agentSnap = await goals_db.collection('agents').doc(agentId).get();
        agentDataToUse = agentSnap.exists ? agentSnap.data()! as Record<string, any> : defaultGoalmaticAgent;
    }

    return { userDetails: userDetailsForAgent, agentData: agentDataToUse, error: null };
}

// Helper function to process different message content types
export const processMessageContent = async (
    message: any,
    from: string,
    phone_number_id: string,
    agentData: Record<string, any>
) => {
    let msg_body_for_agent: string | { isImage: boolean, buffer: Buffer, contentType: string, caption?: string } | { role: string, content: string } | { type: string, mimeType?: string, data?: Buffer, text?: string }[];
    let messageTypeForAgent = 'text';

    if (message.type === 'text') {
        msg_body_for_agent = message.text.body;
    } else if (message.type === 'audio') {
        const transcription = await transcribeWhatsAppAudio(message.audio.id, from, phone_number_id);
        msg_body_for_agent = transcription;
        messageTypeForAgent = 'audio';
    } else if (message.type === 'image') {
        const imageCaption = message.image.caption || '';
        msg_body_for_agent = await processWhatsAppImage(message.image.id, from, phone_number_id, agentData, imageCaption);
        messageTypeForAgent = 'image';
    } else {
        msg_body_for_agent = "Received an unhandled message type.";
        console.warn("Webhook: Unhandled message type made it past initial checks:", message.type);
    }

    return { msg_body_for_agent, messageTypeForAgent };
}

// Helper function to process commands (messages starting with /)
export const processCommand = async (
    textBody: string,
    from: string,
    phone_number_id: string
): Promise<{ handled: boolean; shouldReturn: boolean }> => {
    if (!textBody.startsWith('/')) {
        return { handled: false, shouldReturn: false };
    }

    let systemResponseForCommand = "";
    let actualUserIdForFirestore: string | null = null;
    let userDetailsFromDb: any = null;

    try {
        const userDetailsResult = await getDetailsByPhone(from);
        const potentialUserData = userDetailsResult.data as { user_id?: string;[key: string]: any } | null;

        if (userDetailsResult.status === 200 && potentialUserData && potentialUserData.user_id) {
            actualUserIdForFirestore = potentialUserData.user_id;
            userDetailsFromDb = potentialUserData;
        } else {
            systemResponseForCommand = userDetailsResult.status === 404
                ? "User account not found. Please register at goalmatic.io or link your WhatsApp number."
                : "Could not identify your user account. Please ensure you are registered and your WhatsApp number is linked.";

            const errData = get_WA_TextMessageInput(from, systemResponseForCommand);
            await send_WA_Message(errData, phone_number_id);
            return { handled: true, shouldReturn: true };
        }
    } catch (e) {
        console.error("Error fetching user details for command:", e);
        const errData = get_WA_TextMessageInput(from, "An error occurred while verifying your account for command processing.");
        await send_WA_Message(errData, phone_number_id);
        return { handled: true, shouldReturn: true };
    }

    if (!actualUserIdForFirestore) {
        console.warn("Command received but user ID could not be established for:", from);
        return { handled: true, shouldReturn: true };
    }

    const userDocRef = goals_db.collection('users').doc(actualUserIdForFirestore);

    if (textBody === '/') {
        systemResponseForCommand = `Goalmatic Commands:\n/n - Start a New Chat Session\n/l - List Recent Chat Sessions\n/s <ID> - Switch to Chat Session\n/d - Show Current Session Details`;
    } else {
        const parts = textBody.substring(1).split(' ');
        const commandChar = parts[0].toLowerCase();
        switch (commandChar) {
            case 'n':
                await userDocRef.set({ forceNewWhatsappSession: true, lastCommandAt: Timestamp.now() }, { merge: true });
                systemResponseForCommand = "Your next message will start a new chat session.";
                break;
            case 'l':
                systemResponseForCommand = "Command /l (List Sessions) - Coming soon!";
                break;
            case 's':
                systemResponseForCommand = "Command /s (Switch Session) - Coming soon!";
                break;
            case 'd':
                systemResponseForCommand = "Command /d (Current Session) - Coming soon!";
                break;
            default:
                systemResponseForCommand = `Unknown command: ${textBody}\nType / for a list of commands.`;
        }
    }

    // Get agent data for command handling
    let agentDataForCmdHandling: Record<string, any> = defaultGoalmaticAgent;
    if (userDetailsFromDb) {
        const userConfig = (userDetailsFromDb as any).config;
        const agentId = userConfig?.selected_agent_id;
        if (agentId) {
            const agentSnap = await goals_db.collection('agents').doc(agentId).get();
            if (agentSnap.exists) agentDataForCmdHandling = agentSnap.data()!;
        }
    }

    const cmdHandlingResponse = await WhatsappAgent(
        { ...userDetailsFromDb, user_id: actualUserIdForFirestore },
        textBody,
        agentDataForCmdHandling,
        'command',
        systemResponseForCommand
    );

    const cmdResData = get_WA_TextMessageInput(from, cmdHandlingResponse.msg);
    await send_WA_Message(cmdResData, phone_number_id);

    return { handled: true, shouldReturn: true };
}

// Helper function to handle button clicks
export const handleButtonClick = async (
    message: any,
    from: string,
    phone_number_id: string
): Promise<{ handled: boolean }> => {
    if (message.type === 'button' && message.button && message.button.text === 'Get Formatted Message') {
        const payloadId = message.button.payload;
        const cswSnap = await goals_db.collection('CSW').doc(from).collection('nonFormattedMessages').doc(payloadId).get();
        const payloadMsg = cswSnap.data()?.message || 'No message found';
        const data = send_WA_ImageMessageInput(from, payloadMsg);
        await send_WA_Message(data, phone_number_id);
        return { handled: true };
    }
    return { handled: false };
}

// Helper function to check for unsupported message types
export const checkUnsupportedMessageTypes = async (
    message: any,
    from: string,
    phone_number_id: string
): Promise<{ isUnsupported: boolean }> => {
    if (['document', 'video', 'sticker', 'location', 'contacts', 'unsupported'].includes(message.type)) {
        const errorMsgText = 'Sorry, some media messages (documents, videos, stickers, location, contacts) are not supported. Please send text messages, images, or voice notes.'
        const errorMsgData = get_WA_TextMessageInput(from, errorMsgText)
        await send_WA_Message(errorMsgData, phone_number_id)
        return { isUnsupported: true };
    }
    return { isUnsupported: false };
}

// Helper function to log customer service window
export const logCustomerServiceWindow = (phoneNumber: string) => {
    goals_db.collection('CSW').doc(phoneNumber).set({
        phoneNumber,
        lastReceivedMessage: new Date().toISOString()
    }, { merge: true }).catch(err => console.error("Error logging CSW:", err));
}

/**
 * Check if a message has already been processed to prevent duplicates
 * Store processed message IDs in Firestore with TTL for cleanup
 */
export async function isDuplicateMessage(messageId: string): Promise<boolean> {
    try {
        const processedMessageRef = goals_db.collection('processed_messages').doc(messageId);
        const doc = await processedMessageRef.get();
        
        if (doc.exists) {
            console.log(`Duplicate message detected: ${messageId}`);
            return true;
        }
        
        // Mark message as processed with TTL (24 hours)
        const expiresAt = new Date();
        expiresAt.setHours(expiresAt.getHours() + 24);
        
        await processedMessageRef.set({
            processed_at: new Date(),
            expires_at: expiresAt
        });
        
        return false;
    } catch (error) {
        console.error('Error checking/storing message ID:', error);
        // If we can't check duplicates, allow processing to avoid missing messages
        return false;
    }
} 
