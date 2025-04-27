import {  InvalidPromptError, generateText } from "ai"
import { createGoogleGenerativeAI } from "@ai-sdk/google"
import { generateAgentTools } from './tools';
import { setUserToolConfig } from ".";





export const initialiseAIChat = async (history: any[] = [], agent: Record<string, any>, isImageRequest: boolean = false) => {

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

        const agentTools = generateAgentTools(agent.spec.tools);
        const agentSystemInfo = customSystemInfo(agent.spec.tools, agent.spec.systemInfo);
        const result = await generateText({
            model: google("gemini-2.5-flash-preview-04-17"),
            maxSteps: 5,
            messages: conversationHistory,
            tools: agentTools,
            system: agentSystemInfo,
        });


        return result.text;
    } catch (error) {
        if (InvalidPromptError.isInstance(error)) {
            console.error('Error initializing AI chat:', error.message, error.cause);
        }
        throw error;
    }
};


const customSystemInfo = (agentTools: Record<string, any>[], agentSystemInfo: string) => {
    return `
    <Available Tools>
    ${agentTools.map((tool) => tool.id)}
    </Available Tools>
    
    <Agent System Info>
    ${agentSystemInfo}
    </Agent System Info>
    `
}