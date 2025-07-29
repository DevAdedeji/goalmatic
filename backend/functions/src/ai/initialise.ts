import {  InvalidPromptError, generateText } from "ai"
import { createGoogleGenerativeAI } from "@ai-sdk/google"
import { generateAgentTools } from './tools';
import { setUserToolConfig } from ".";
import { HttpsError } from "firebase-functions/https";
import { formatSystemInfo } from "../init";


/**
 * Initialize AI chat with conversation history and agent configuration
 *
 * @param history Array of conversation messages
 * @param agent Agent configuration object
 * @param sessionId Chat session ID for logging tool calls
 * @param isImageRequest Whether this is an image request
 * @returns The AI response text
 */
export const initialiseAIChat = async (
    history: any[] = [],
    agent: Record<string, any>,
    sessionId: string,
    isImageRequest: boolean = false
) => {
    const google = createGoogleGenerativeAI({
        apiKey: process.env.GOOGLE_API_KEY,
    })

    setUserToolConfig(agent.spec.toolsConfig);
    try {
        // Process messages, handling any that might contain image data
        const conversationHistory = history.map((msg) => {
            if (msg.content && Array.isArray(msg.content)) {
                return {
                    role: msg.role,
                    content: msg.content // Keep the array structure for files/images
                };
            }
            // Otherwise, process as normal text
            return {
                role: msg.role,
                content: msg.content ?? 'null',
            };
        });

        // Pass the sessionId to generateAgentTools for tool call logging
        const agentTools = generateAgentTools(agent.spec.tools, sessionId);
        const agentSystemInfo = customSystemInfo(agent.spec.tools, agent.spec.systemInfo);
        const result = await generateText({
            model: google("gemini-2.5-flash"),
            maxSteps: 25,
            messages: conversationHistory,
            tools: agentTools,
            system: agentSystemInfo,
        });

        return result.text;
    } catch (error) {
        if (InvalidPromptError.isInstance(error)) {
            throw new HttpsError('invalid-argument', error.message);
        }
        throw error;
    }
};


const customSystemInfo = (agentTools: Record<string, any>[], agentSystemInfo: string) => {
    const formattedAgentSystemInfo = formatSystemInfo(agentSystemInfo);

    // console.log(formattedAgentSystemInfo, 'formattedAgentSystemInfo');
    
    return `
    <Available Tools>
    ${agentTools.map((tool) => tool.id)}
    </Available Tools>

    <Agent System Info>
    ${formattedAgentSystemInfo}
    </Agent System Info>
    `
}