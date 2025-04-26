"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initialiseAIChat = void 0;
const ai_1 = require("ai");
const google_1 = require("@ai-sdk/google");
const tools_1 = require("./tools");
const google = (0, google_1.createGoogleGenerativeAI)({
    apiKey: process.env.GOOGLE_API_KEY,
});
const initialiseAIChat = async (history = [], agent, isImageRequest = false) => {
    try {
        // Process messages, handling any that might contain image data
        const conversationHistory = history.map((msg) => {
            // If the message has array content (for images), handle it specially
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
        const agentTools = (0, tools_1.generateAgentTools)(agent.spec.tools);
        const agentSystemInfo = customSystemInfo(agent.spec.tools, agent.spec.systemInfo);
        const result = await (0, ai_1.generateText)({
            model: google("gemini-2.5-flash-preview-04-17"),
            maxSteps: 5,
            messages: conversationHistory,
            tools: agentTools,
            system: agentSystemInfo,
        });
        return result.text;
    }
    catch (error) {
        if (ai_1.InvalidPromptError.isInstance(error)) {
            console.error('Error initializing AI chat:', error.message, error.cause);
        }
        throw error;
    }
};
exports.initialiseAIChat = initialiseAIChat;
const customSystemInfo = (agentTools, agentSystemInfo) => {
    return `
    <Available Tools>
    ${agentTools.map((tool) => tool.id)}
    </Available Tools>
    
    <Agent System Info>
    ${agentSystemInfo}
    </Agent System Info>
    `;
};
