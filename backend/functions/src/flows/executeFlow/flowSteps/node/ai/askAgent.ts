import { WorkflowContext } from "@upstash/workflow";
import { FlowNode } from "../../../type";
import { processMentionsProps } from "../../../../../utils/processMentions";
import { generateAiFlowContext } from "../../../../../utils/generateAiFlowContext";
import { goals_db } from "../../../../../init";
import { initialiseAIChat } from "../../../../../ai/initialise";
import { v4 as uuidv4 } from 'uuid';

const askAgent = async (context: WorkflowContext, step: FlowNode, previousStepResult: any) => {
    try {
        // Process all string fields in propsData first
        const processedProps = processMentionsProps(step.propsData, previousStepResult);

        // Generate AI content for AI-enabled fields and get updated props
        const { processedPropsWithAiContext } = await generateAiFlowContext(step, processedProps);

        const {
            selectedAgent,
            inputData,
            customInstructions = ''
        } = processedPropsWithAiContext;

        // Extract user ID from the flow data
        const { userId } = context.requestPayload as { userId: string };
        if (!userId) {
            throw new Error('User ID not found in flow data');
        }

        if (!selectedAgent || !inputData) {
            return {
                success: false,
                error: 'Selected agent and input data are required'
            };
        }

        // Get agent ID and data
        const agentId = typeof selectedAgent === 'string' ? selectedAgent : selectedAgent.id;
        let agentData = typeof selectedAgent === 'object' ? selectedAgent : null;

        if (!agentData) {
            if (agentId === '0') {
                // Use default agent
                agentData = {
                    id: '0',
                    name: 'Goalmatic 1.0',
                    description: 'The Default agent for Goalmatic',
                    spec: {
                        systemInfo: 'You are a helpful assistant',
                        tools: [],
                        toolsConfig: {}
                    }
                };
            } else {
                const agentDoc = await goals_db.collection('agents').doc(agentId).get();
                if (!agentDoc.exists) {
                    return {
                        success: false,
                        error: 'Agent not found'
                    };
                }
                agentData = { id: agentId, ...agentDoc.data() };
            }
        }

        // Create system prompt with custom instructions
        const systemPrompt = customInstructions
            ? `${agentData.spec.systemInfo}\n\nAdditional Instructions: ${customInstructions}`
            : agentData.spec.systemInfo;

        // Create agent with updated system prompt
        const agent = {
            ...agentData,
            spec: {
                ...agentData.spec,
                systemInfo: systemPrompt
            }
        };

        // Simple conversation with just the input data
        const conversation = [{
            role: 'user',
            content: typeof inputData === 'string' ? inputData : JSON.stringify(inputData, null, 2)
        }];

        // Call the AI agent
        const agentResponse = await initialiseAIChat(conversation, agent, uuidv4());

        return {
            success: true,
            payload: {
                ...processedPropsWithAiContext,
                agentResponse,
                agentInfo: {
                    id: agentData.id,
                    name: agentData.name,
                    description: agentData.description
                },
                sessionId: uuidv4()
            }
        };

    } catch (error: any) {
        console.error('Error in AI agent processing:', error);
        return {
            success: false,
            error: error?.message || 'Failed to process data with AI agent'
        };
    }
};

export const askAgentNode = {
    nodeId: 'ASK_AGENT',
    run: askAgent
};
