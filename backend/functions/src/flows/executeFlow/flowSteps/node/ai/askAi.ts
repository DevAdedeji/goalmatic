import { WorkflowContext } from "@upstash/workflow";
import { FlowNode } from "../../../type";
import { processMentionsProps } from "../../../../../utils/processMentions";
import { generateAiFlowContext } from "../../../../../utils/generateAiFlowContext";
import { generateText } from "ai";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { v4 as uuidv4 } from 'uuid';

const askAi = async (_context: WorkflowContext, step: FlowNode, previousStepResult: any) => {
    try {
        // Process all string fields in propsData first
        const processedProps = processMentionsProps(step.propsData, previousStepResult);

        // Generate AI content for AI-enabled fields and get updated props
        const { processedPropsWithAiContext } = await generateAiFlowContext(step, processedProps);

        const {
            inputData,
            customInstructions = ''
        } = processedPropsWithAiContext;

        if (!inputData) {
            return {
                success: false,
                error: 'Input data is required'
            };
        }

        // Create system prompt with custom instructions
        const systemPrompt = customInstructions
            ? `You are a helpful AI assistant. ${customInstructions}`
            : 'You are a helpful AI assistant. Respond to the user\'s prompt clearly and concisely.';

        // Initialize Google AI
        const google = createGoogleGenerativeAI({
            apiKey: process.env.GOOGLE_API_KEY,
        });

        // Call the AI directly with generateText
        const result = await generateText({
            model: google("gemini-2.5-flash"),
            system: systemPrompt,
            prompt: typeof inputData === 'string' ? inputData : JSON.stringify(inputData, null, 2)
        });

        const aiResponse = result.text;

        return {
            success: true,
            payload: {
                ...processedPropsWithAiContext,
                aiResponse,
                sessionId: uuidv4()
            }
        };

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
