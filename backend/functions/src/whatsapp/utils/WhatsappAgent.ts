import { goals_db } from '../../init';
import { setUserUid } from '../../ai';
import { initialiseAIChat } from '../../ai/initialise';
import { APICallError } from 'ai';
import { Timestamp } from 'firebase-admin/firestore';
import { v4 as uuidv4 } from 'uuid';
import { createMediaChatEntry } from './mediaStorage';
import { processWhatsAppImageWithStorage } from './processImage';
import { transcribeWhatsAppAudioWithStorage } from './transcribeAudio';
import { prepareChatHistoryForAI } from './aiMediaAccess';

export const defaultGoalmaticAgent = {
    id: '0', 
    name: 'Goalmatic 1.0',
    description: 'The Default plain agent for Goalmatic',
    published: true,
    user: {
        name: 'goalmatic'
    },
    spec: {
        systemInfo: 'You are a helpful assistant',
        tools: []
    },
    created_at: new Date('2025-01-01').toISOString()
};

const updateChatSessionWithMessages = async (
    chatSessionRef: FirebaseFirestore.DocumentReference,
    chatSessionDocSnapshot: FirebaseFirestore.DocumentSnapshot, // Renamed for clarity
    newMessages: Record<string, any>[],
    agentData: Record<string, any>
) => {
    try {
        const userId = chatSessionRef.parent.parent!.id;
        // const isNewSession = !chatSessionDocSnapshot.exists; // Not strictly needed here, determined by caller

        if (chatSessionDocSnapshot.exists) {
            const chatSessionData = chatSessionDocSnapshot.data() || {};
            const existingMessages = Array.isArray(chatSessionData.messages) ? chatSessionData.messages : [];
            const updatedMessages = [...existingMessages, ...newMessages];
            
            let updatePayload: FirebaseFirestore.UpdateData<FirebaseFirestore.DocumentData> = {
                messages: updatedMessages,
                updated_at: Timestamp.now(),
                agent_id: agentData.id || defaultGoalmaticAgent.id // Keep agent_id updated
            };

            // If summary is missing or was placeholder, and we have actual messages, try to generate a real one.
            if ((!chatSessionData.summary || chatSessionData.summary === "New Session" || chatSessionData.summary.length === 0) && updatedMessages.length > 0) {
                const firstUserMessage = updatedMessages.find(m => m.role === 'user');
                let summaryText = "Chat started";
                if (firstUserMessage && firstUserMessage.content) {
                    summaryText = typeof firstUserMessage.content === 'string' ? firstUserMessage.content.substring(0,100) : "Media message received";
                    if (summaryText.length === 100) summaryText += "...";
                }
                updatePayload.summary = summaryText;
            }

            await chatSessionRef.update(updatePayload);
        } else {
            const shortId = chatSessionRef.id.substring(0, 8);
            let summary = "New Session";
            if (newMessages.length > 0 && newMessages[0].content) {
                const firstContent = newMessages[0].content;
                summary = typeof firstContent === 'string' ? firstContent.substring(0,100) : "Media message received";
                if (summary.length === 100) summary += "...";
            }

            await chatSessionRef.set({
                id: chatSessionRef.id,
                shortId: shortId, 
                user_id: userId,
                agent_id: agentData.id || defaultGoalmaticAgent.id,
                created_at: Timestamp.now(),
                updated_at: Timestamp.now(),
                messages: newMessages,
                summary: summary 
            });
        }
    } catch (error) {
        console.error('Error updating/creating chat session with messages:', error);
        throw error;
    }
};

export const WhatsappAgent = async (
    userDetails: { user_id: string; [key: string]: any }, 
    userMsg: string | { isImage: boolean; buffer: Buffer; contentType: string; caption?: string; filePath?: string } | { role: string; content: string } | { type: string; mimeType?: string; data?: Buffer; text?: string }[],
    agentData: Record<string, any>,
    messageType: string = 'text',
    precomputedAssistantResponse?: string, // New parameter for command replies
    originalMessage?: any // Original WhatsApp message for media storage handling
) => {
    try {
        if (!userDetails || !userDetails.user_id) {
            console.error("WhatsappAgent: user_id is missing from userDetails.");
            return { data: null, status: 500, msg: "Internal error: User identification is missing." };
        }
        setUserUid(userDetails.user_id);

        const userDocRef = goals_db.collection('users').doc(userDetails.user_id);
        const userDocSnap = await userDocRef.get();
        const userDocumentData = userDocSnap.exists ? userDocSnap.data()! : {};

        let currentSessionId = userDocumentData.activeWhatsappSessionId as string | undefined;
        const forceNewSession = userDocumentData.forceNewWhatsappSession === true;


        let sessionNeedsCreation = false;

        if (forceNewSession) {
            currentSessionId = `whatsapp_${uuidv4()}`;
            sessionNeedsCreation = true;
            console.log(`Forcing new session for user ${userDetails.user_id}: ${currentSessionId}`);
        } else if (!currentSessionId) {
            currentSessionId = `whatsapp_${uuidv4()}`;
            sessionNeedsCreation = true;
            console.log(`No active session for user ${userDetails.user_id}, creating new: ${currentSessionId}`);
        } else {
            console.log(`Continuing session ${currentSessionId} for user ${userDetails.user_id}`);
        }

        
        
        const chatSessionRef = userDocRef.collection('chatSessions').doc(currentSessionId!);
        let chatSessionDoc = await chatSessionRef.get(); 
        
        let history: Record<string, any>[] = [];
        if (!sessionNeedsCreation && chatSessionDoc.exists) {
            const chatSessionData = chatSessionDoc.data();
            if (chatSessionData && Array.isArray(chatSessionData.messages)) {
                const rawHistory = chatSessionData.messages.map(msg => ({ role: msg.role, content: msg.content }));
                // Convert file paths to signed URLs for AI access
                history = await prepareChatHistoryForAI(rawHistory, userDetails.user_id);
            }
        }

        let resultForWebhook: string;
        let userMessageForStorage: Record<string, any>;
        let assistantMessageForStorage: Record<string, any>;

        if (messageType === 'command' && precomputedAssistantResponse) {
            // This is a command interaction, save command and its response, bypass AI
            userMessageForStorage = {
                id: uuidv4(),
                role: 'user',
                content: userMsg as string, // userMsg will be the command text e.g., "/n"
                messageType: 'command',
                timestamp: Timestamp.now(),
                agent_id: agentData.id || defaultGoalmaticAgent.id
            };
            assistantMessageForStorage = {
                id: uuidv4(),
                role: 'assistant', // Or a new role like 'system' if preferred for command replies
                content: precomputedAssistantResponse,
                messageType: 'system_response', // New messageType
                timestamp: Timestamp.now(), // Consider if timestamp should be slightly after user command
                agent_id: agentData.id || defaultGoalmaticAgent.id
            };
            resultForWebhook = precomputedAssistantResponse;
            // AI call (initialiseAIChat) is skipped
        } else {
            // Normal message processing (text, image, audio)
            const isImageMsg = typeof userMsg === 'object' && 'isImage' in userMsg && userMsg.isImage;
            if (isImageMsg) {
                const imgDetails = userMsg as { isImage: boolean; buffer: Buffer; contentType: string; caption?: string; filePath?: string };
                const hasCaption = imgDetails.caption && imgDetails.caption.trim() !== '';
                const baseImageDescForHistory = `[Image Message]${hasCaption ? ` Caption: "${imgDetails.caption}"` : ''}`;
                
                // If we have original message, process for storage
                let enhancedImgDetails = imgDetails;
                if (originalMessage && originalMessage.type === 'image' && originalMessage.image) {
                    try {
                        const enhancedResult = await processWhatsAppImageWithStorage(
                            originalMessage.image.id,
                            userDetails.user_id,
                            currentSessionId!,
                            undefined, // Don't send processing messages since we already did
                            undefined,
                            agentData,
                            originalMessage.image.caption || ''
                        );
                        enhancedImgDetails = { ...imgDetails, filePath: enhancedResult.filePath };
                    } catch (error) {
                        console.error('Failed to process image with storage:', error);
                        // Continue with original image details
                    }
                }
                
                const aiPayloadContent: any[] = [ 
                    { type: 'text', text: baseImageDescForHistory },
                    {
                        type: 'file',
                        mimeType: enhancedImgDetails.contentType || 'image/jpeg',
                        data: enhancedImgDetails.buffer,
                    }
                ];
                const messagesForAI = [...history, {role: 'user', content: aiPayloadContent}];
                resultForWebhook = await initialiseAIChat(messagesForAI, agentData, currentSessionId!, true);
                
                // Create enhanced chat history entry with file path if available
                let storedImageDesc: string;
                if (enhancedImgDetails.filePath) {
                    storedImageDesc = createMediaChatEntry(
                        'image',
                        `User sent an image${hasCaption ? ` with caption: "${enhancedImgDetails.caption}"` : ''}`,
                        enhancedImgDetails.filePath,
                        enhancedImgDetails.caption
                    );
                } else {
                    storedImageDesc = `[Image Message] User sent an image${hasCaption ? ` with caption: "${enhancedImgDetails.caption}"` : ''}`;
                }
                
                userMessageForStorage = {
                    id: uuidv4(), role: 'user', content: storedImageDesc, messageType: 'image',
                    timestamp: Timestamp.now(), agent_id: agentData.id || defaultGoalmaticAgent.id
                };
            } else { 
                let userTextContent: string;
                let displayContent: string;
                let audioFilePath: string | undefined;
                
                if (typeof userMsg === 'object' && 'role' in userMsg && 'content' in userMsg) {
                    userTextContent = userMsg.content as string;
                    displayContent = userTextContent;
                } else {
                    userTextContent = userMsg as string || 'n/a';
                    
                    // Handle audio messages with potential storage
                    if (messageType === 'audio' && originalMessage && originalMessage.type === 'audio' && originalMessage.audio) {
                        try {
                            const audioResult = await transcribeWhatsAppAudioWithStorage(
                                originalMessage.audio.id,
                                userDetails.user_id,
                                currentSessionId!,
                                undefined, // Don't send processing messages since we already did
                                undefined
                            );
                            audioFilePath = audioResult.filePath;
                            // Use the transcription from storage version if available
                            if (audioResult.transcription && audioResult.transcription !== userTextContent) {
                                userTextContent = audioResult.transcription;
                            }
                        } catch (error) {
                            console.error('Failed to process audio with storage:', error);
                            // Continue with original transcription
                        }
                    }
                    
                    if (messageType === 'audio') {
                        if (audioFilePath) {
                            displayContent = createMediaChatEntry('audio', userTextContent, audioFilePath);
                        } else {
                            displayContent = `[Voice Message] ${userTextContent}`;
                        }
                    } else {
                        displayContent = userTextContent;
                    }
                }
                const aiHistory = [...history, {role: 'user', content: userTextContent }];
                userMessageForStorage = {
                    id: uuidv4(), role: 'user', content: displayContent, messageType: messageType,
                    timestamp: Timestamp.now(), agent_id: agentData.id || defaultGoalmaticAgent.id
                };
                resultForWebhook = await initialiseAIChat(aiHistory, agentData, currentSessionId!);
            }
            // Standard assistant message storage for AI responses
            assistantMessageForStorage = {
                id: uuidv4(), role: 'assistant', content: resultForWebhook ?? 'n/a', messageType: 'text',
                timestamp: Timestamp.now(), agent_id: agentData.id || defaultGoalmaticAgent.id
            };
        }
        
        chatSessionDoc = await chatSessionRef.get(); // Fetch latest before update
        await updateChatSessionWithMessages(chatSessionRef, chatSessionDoc, [userMessageForStorage, assistantMessageForStorage], agentData);

        const userUpdateData: FirebaseFirestore.UpdateData<FirebaseFirestore.DocumentData> = {
            activeWhatsappSessionId: currentSessionId,
            lastWhatsappSessionUpdatedAt: Timestamp.now()
        };
        if (forceNewSession) {
            userUpdateData.forceNewWhatsappSession = false; 
        }
        await userDocRef.set(userUpdateData, { merge: true });

        return { data: agentData, status: 200, msg: `${resultForWebhook}` };

    } catch (e: any) {
        console.error('Error in Whatsapp Agent:', e.message, e.stack);
        const errorMsg = APICallError.isInstance(e) ? 
            `An error occurred while processing your request, Please try again later` : 
            `Error in Whatsapp Agent: ${e.message}`;
        return { data: e, status: 500, msg: errorMsg };
    }
};


