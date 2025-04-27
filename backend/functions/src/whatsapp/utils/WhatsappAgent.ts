import { is_dev } from '../../init';
import { setUserUid } from '../../ai';
import { initialiseAIChat } from '../../ai/initialise';
// @ts-ignore: Cannot find module '@upstash/redis'
import { Redis } from '@upstash/redis';
import { APICallError } from 'ai';

export const defaultGoalmaticAgent = {
    id: 0,
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
}

const redis = new Redis({
  url: is_dev ? process.env.REDIS_URL_DEV : process.env.REDIS_URL,
  token: is_dev ? process.env.REDIS_TOKEN_DEV : process.env.REDIS_TOKEN,
});

export const WhatsappAgent = async (
    userDetails: Record<string, any>, 
    userMsg: string | { isImage: boolean, buffer: Buffer, contentType: string } | { role: string, content: string } | { type: string, mimeType?: string, data?: Buffer, text?: string }[],
    agentData: Record<string, any>
) => {
    try {
        setUserUid(userDetails.user_id);

        // Retrieve previous conversation history from Redis
        const redisKey = `whatsapp_history:${userDetails.user_id}`;
        let history: Record<string, any>[] = [];
        const existingHistoryStr = await redis.get(redisKey) as Record<string, any>[]
        if (existingHistoryStr) {
            try {
                history = existingHistoryStr
            } catch(err) {
                console.error('Error parsing existing conversation history:', err);
            }
        }

        // console.log(JSON.stringify(userMsg));

        // Check if the message is an image
        let result;
        if (typeof userMsg === 'object' && 'isImage' in userMsg && userMsg.isImage) {
            // The message is an image - don't store it in history but pass it to the AI model
            
            // Add a placeholder message in the history
            history.push({
                role: 'user',
                content: 'I sent an image for analysis.'
            });
            
            
            const imageMessages = [
                ...history,
                {
                    role: 'user',
                    content: [
                        {
                            type: 'file',
                            mimeType: userMsg.contentType || 'image/jpeg',
                            data: userMsg.buffer,
                        }
                    ],
                }
            ];
            
            // Pass the special image message array to the AI
            result = await initialiseAIChat(imageMessages, agentData, true);
        } else {
            // Normal message handling 
            // Append the new user message to the conversation history
            // If userMsg is already in the format {role, content}, add it directly
            if (typeof userMsg === 'object' && 'role' in userMsg && 'content' in userMsg) {
                history.push(userMsg);
            } else {
                // Otherwise format it as a user message
                history.push({role: 'user', content: userMsg ?? 'n/a'});
            }
            
            // Get AI chat response with the updated history
            result = await initialiseAIChat(history, agentData);
        }

        
        // Append the assistant's response to the conversation history
        history.push({role: 'assistant', content: result ?? 'n/a'});

        // Persist the updated conversation history back to Redis
        await redis.set(redisKey, JSON.stringify(history), { ex: 86400 });

        return { data: agentData, status: 200, msg: `${result}` };
        
    } catch (e) {
        if (APICallError.isInstance(e)) {
            // Handle the error
            return { data: e, status: 500, msg: `An error occurred while processing your request, Please try again later` };
        }
        return { data: e, status: 500, msg: `Error in Whatsapp Agent: ${e}` };
    }
}


