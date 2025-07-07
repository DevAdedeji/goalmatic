import { availableTools } from "./list";
import type { ToolSet, Tool } from 'ai';
import { logToolCall } from "./logToolCall";

// Create a wrapper for tools to log their calls
const createLoggingToolWrapper = (toolId: string, originalTool: any, sessionId: string): Tool => {
    // Create a new tool that wraps the original
    return {
        ...originalTool,
        execute: async (params: any) => {
            try {
                logToolCall(sessionId, toolId, params);
                // Check if the execute function exists before calling it
                if (!originalTool.execute) {
                    throw new Error(`Tool ${toolId} does not have an execute function.`);
                }
                return await originalTool.execute(params);
            } catch (error) {
                throw error;
            }
        }
    };
};

export const generateAgentTools = (agentToolSpec: Record<string, any>[], sessionId: string) => {
    const includedTools: ToolSet = {}

    agentToolSpec.forEach((sentTool) => {
        const toolObject = availableTools[sentTool.id]
        if (toolObject) {
            // Wrap the original tool with logging functionality
            includedTools[toolObject.id] = createLoggingToolWrapper(
                toolObject.id,
                toolObject.tool,
                sessionId
            );
        }
    })

    console.log(includedTools);
    return includedTools
}