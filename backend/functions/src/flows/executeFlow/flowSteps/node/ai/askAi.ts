import { WorkflowContext } from "@upstash/workflow";
import { FlowNode } from "../../../type";
import { processMentionsProps } from "../../../../../utils/processMentions";
import { generateAiFlowContext } from "../../../../../utils/generateAiFlowContext";
import { generateText } from "ai";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { v4 as uuidv4 } from 'uuid';
import { generateAgentTools } from "../../../../../ai/tools";

const askAi = async (_context: WorkflowContext, step: FlowNode, previousStepResult: any) => {
    try {
        // Process all string fields in propsData first
        const processedProps = processMentionsProps(step.propsData, previousStepResult);

        // Generate AI content for AI-enabled fields and get updated props
        const { processedPropsWithAiContext } = await generateAiFlowContext(step, processedProps);

        const {
            mode = 'simple',
            selectedTools = [],
            inputData,
            customInstructions = ''
        } = processedPropsWithAiContext;

        if (!inputData) {
            return {
                success: false,
                error: 'Input data is required'
            };
        }

        // Initialize Google AI
        const google = createGoogleGenerativeAI({
            apiKey: process.env.GOOGLE_API_KEY,
        });

        const sessionId = uuidv4();

        if (mode === 'tools' && selectedTools) {
            // Tools mode - use AI with tool integration
            // Parse comma-separated tool IDs
            const toolIds = typeof selectedTools === 'string'
                ? selectedTools.split(',').map(id => id.trim()).filter(id => id.length > 0)
                : Array.isArray(selectedTools)
                    ? selectedTools.map((tool: any) => typeof tool === 'string' ? tool : tool.id || tool.value)
                    : [];

            if (toolIds.length === 0) {
                return {
                    success: false,
                    error: 'No valid tools specified for tools mode'
                };
            }

            const toolSpecs = toolIds.map((id: string) => ({ id }));

            // Generate tools for the AI
            const agentTools = generateAgentTools(toolSpecs, sessionId);

            // Create enhanced system prompt for tools mode
            const systemPrompt = customInstructions
                ? `You are a helpful AI assistant with access to tools. ${customInstructions}\n\nUse the available tools when they can help complete the user's request.`
                : 'You are a helpful AI assistant with access to tools. Use the available tools when they can help complete the user\'s request.';

            // Call the AI with tools
            const result = await generateText({
                model: google("gemini-2.5-flash"),
                system: systemPrompt,
                prompt: typeof inputData === 'string' ? inputData : JSON.stringify(inputData, null, 2),
                tools: agentTools,
                maxSteps: 10
            });

            return {
                success: true,
                payload: {
                    ...processedPropsWithAiContext,
                    aiResponse: result.text,
                    toolResults: result.toolResults || [],
                    sessionId
                }
            };
        } else {
            // Simple mode - basic AI without tools
            const systemPrompt = customInstructions
                ? `You are a helpful AI assistant. ${customInstructions}`
                : 'You are a helpful AI assistant. Respond to the user\'s prompt clearly and concisely.';

            // Call the AI directly with generateText
            const result = await generateText({
                model: google("gemini-2.5-flash"),
                system: systemPrompt,
                prompt: typeof inputData === 'string' ? inputData : JSON.stringify(inputData, null, 2)
            });

            return {
                success: true,
                payload: {
                    ...processedPropsWithAiContext,
                    aiResponse: result.text,
                    toolResults: [],
                    sessionId
                }
            };
        }

    } catch (error: any) {
        console.error('Error in Ask AI processing:', error);
        return {
            success: false,
            error: error?.message || 'Failed to process AI request'
        };
    }
};

export const askAiNode = {
    nodeId: 'ASK_AI',
    run: askAi
};
