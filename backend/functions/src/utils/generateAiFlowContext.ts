import { FlowNode } from "../flows/executeFlow/type";
import { generateText } from "ai";
import { createGoogleGenerativeAI } from "@ai-sdk/google";

type AiFlowContext = {
    name: string;
    description: string;
    propsData: Record<string, any>;
    processedProps: Record<string, any>;
}

// Initialize Google Generative AI client
const google = createGoogleGenerativeAI({
    apiKey: process.env.GOOGLE_API_KEY,
});

// AI content generation function using Gemini 2.0 Flash
const generateAiContent = async (originalValue: string, { name, description, propsData, processedProps }: AiFlowContext ): Promise<string> => {
    const systemPrompt = `
    You are now a helpful assistant that helps the user with whatever they ask you to do. You are not an ai assistant, you are a human assistant.
    `;

    try {
        const result = await generateText({
            model: google("gemini-2.5-flash-preview-05-20"),
            system: systemPrompt,
            prompt: originalValue,
        });

        return result.text;
    } catch (error) {
        console.error('Error generating AI content:', error);
        // Fallback to original value if AI generation fails
        return originalValue;
    }
};

export const generateAiFlowContext = async (
    step: FlowNode, 
    processedProps: Record<string, any>
): Promise<{ processedPropsWithAiContext: Record<string, any> }> => {
    const { aiEnabledFields, name, description, propsData } = step;


    console.log(aiEnabledFields, 'aiEnabledFields');
    // If no AI-enabled fields are specified, return original props
    if (!aiEnabledFields || !Array.isArray(aiEnabledFields) || aiEnabledFields.length === 0) {
        return {
            processedPropsWithAiContext: processedProps,
        };
    }

    // Generate AI content for AI-enabled fields
    const aiGeneratedFields: Record<string, string> = {};
    const processedPropsWithAiContext = { ...processedProps };

    for (const fieldName of aiEnabledFields) {
        if (processedProps.hasOwnProperty(fieldName)) {
            const originalValue = processedProps[fieldName];
            if (typeof originalValue === 'string') {
                try {
                    const aiGeneratedContent = await generateAiContent(originalValue, {
                        name,
                        description,
                        propsData, processedProps
                    });
                    
                    aiGeneratedFields[fieldName] = aiGeneratedContent;
                    processedPropsWithAiContext[fieldName] = aiGeneratedContent;
                } catch (error) {
                    console.error(`Error generating AI content for field ${fieldName}:`, error);
                    // Fallback to original value if AI generation fails
                    aiGeneratedFields[fieldName] = originalValue;
                }
            }
        }
    }



    return {
        processedPropsWithAiContext
    };
};

