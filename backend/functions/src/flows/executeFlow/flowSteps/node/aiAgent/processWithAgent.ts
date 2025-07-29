import { WorkflowContext } from "@upstash/workflow";
import { FlowNode } from "../../../type";
import { processMentionsProps } from "../../../../../utils/processMentions";
import { generateAiFlowContext } from "../../../../../utils/generateAiFlowContext";
import { goals_db } from "../../../../../init";
import { initialiseAIChat } from "../../../../../ai/initialise";
import { v4 as uuidv4 } from 'uuid';

const processWithAgent = async (context: WorkflowContext, step: FlowNode, previousStepResult: any) => {
    try {
        // Process all string fields in propsData first
        const processedProps = processMentionsProps(step.propsData, previousStepResult);
        
        // Generate AI content for AI-enabled fields and get updated props
        const { processedPropsWithAiContext } = await generateAiFlowContext(step, processedProps);
        
        const { 
            selectedAgent,
            inputData,
            customInstructions = '',
            outputFormat = 'text'
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

        // Parse selectedAgent (could be ID string or agent object)
        let agentId;
        let agentData;

        if (typeof selectedAgent === 'string') {
            agentId = selectedAgent;
        } else if (typeof selectedAgent === 'object' && selectedAgent.id) {
            agentId = selectedAgent.id;
            agentData = selectedAgent;
        } else {
            return {
                success: false,
                error: 'Invalid agent selection format'
            };
        }

        // Get the agent details if not already provided
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

        // Parse input data if it's a string
        let parsedInputData;
        try {
            parsedInputData = typeof inputData === 'string' ? JSON.parse(inputData) : inputData;
        } catch (error) {
            parsedInputData = inputData; // Use as-is if not valid JSON
        }

        // Enhanced system prompt with custom instructions
        const enhancedSystemInfo = `
        ${agentData.spec.systemInfo}
        
        ${customInstructions ? `
        ADDITIONAL INSTRUCTIONS:
        ${customInstructions}
        ` : ''}
        
        RESPONSE FORMAT:
        ${outputFormat === 'json' ? 'Please respond with a valid JSON object.' : 
          outputFormat === 'array' ? 'Please respond with a valid JSON array.' : 
          'Please respond with clear, structured text.'}
        `;

        // Create the conversation
        const conversationHistory = [
            {
                role: 'user',
                content: `
                Please process the following data according to your instructions:
                
                ${customInstructions ? `
                SPECIFIC TASK:
                ${customInstructions}
                ` : ''}

                INPUT DATA:
                ${JSON.stringify(parsedInputData, null, 2)}
                
            
                
                Please process this data and provide your response in the ${outputFormat} format.
                `
            }
        ];

        // Use a unique session ID for this processing
        const sessionId = uuidv4();

        // Enhanced agent with custom instructions
        const enhancedAgent = {
            ...agentData,
            spec: {
                ...agentData.spec,
                systemInfo: enhancedSystemInfo
            }
        };

        // Call the AI agent
        const agentResponse = await initialiseAIChat(conversationHistory, enhancedAgent, sessionId);

        // Process the response based on expected format
        let processedData = null;
        
        if (outputFormat === 'json' || outputFormat === 'array') {
            try {
                // Try to extract JSON from the response
                const jsonMatch = agentResponse.match(/\{[\s\S]*\}|\[[\s\S]*\]/);
                if (jsonMatch) {
                    processedData = JSON.parse(jsonMatch[0]);
                }
            } catch (parseError) {
                console.log('Could not parse agent response as JSON, returning as text');
            }
        }



        return {
            success: true,
            payload: {
                ...processedPropsWithAiContext,
                agentResponse,
                processedData,
                agentInfo: {
                    id: agentData.id,
                    name: agentData.name,
                    description: agentData.description
                },
                sessionId
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

export const processWithAgentNode = {
    nodeId: 'AI_AGENT_PROCESS',
    run: processWithAgent
};
