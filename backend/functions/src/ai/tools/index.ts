import { availableTools } from "./list";
import type { ToolSet, Tool } from 'ai';
import { logToolCall } from "./logToolCall";

// Interface for detailed tool information
interface ToolDetails {
    id: string;
    description: string;
    parameters: {
        type: string;
        properties: Record<string, {
            type: string;
            description?: string;
            required?: boolean;
            enum?: string[];
            items?: any;
        }>;
        required: string[];
    };
}

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

// Generate detailed tool information from tool specifications


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

    return includedTools
}


const extractToolDetails = (toolId: string, toolObject: any): ToolDetails => {
    const tool = toolObject.tool;
    const schema = tool.parameters;
    
    // Extract parameter details from Zod schema
    const extractParameterInfo = (zodSchema: any) => {
        const properties: Record<string, any> = {};
        const required: string[] = [];
        
        try {
            if (zodSchema && zodSchema._def) {
                const shape = zodSchema._def.shape ? zodSchema._def.shape() : zodSchema._def.schema?._def?.shape?.();
                
                if (shape) {
                    Object.entries(shape).forEach(([key, value]: [string, any]) => {
                        const field: any = {
                            type: getZodType(value),
                            description: value.description || value._def?.description || `${key} parameter`
                        };
                        
                        // Check if field is required (not optional)
                        if (!value.isOptional?.() && !value._def?.defaultValue) {
                            required.push(key);
                        }
                        
                        // Add enum values if present
                        if (value._def?.values) {
                            field.enum = Array.from(value._def.values);
                        }
                        
                        // Handle array types with nested schemas
                        if (value._def?.type && getZodType(value) === 'array') {
                            const itemType = value._def.type;
                            if (itemType._def?.shape) {
                                // Array of objects
                                const nestedProperties: Record<string, any> = {};
                                const nestedShape = itemType._def.shape();
                                Object.entries(nestedShape).forEach(([nestedKey, nestedValue]: [string, any]) => {
                                    nestedProperties[nestedKey] = {
                                        type: getZodType(nestedValue),
                                        description: nestedValue.description || nestedValue._def?.description || `${nestedKey} field`
                                    };
                                });
                                field.items = {
                                    type: 'object',
                                    properties: nestedProperties
                                };
                            } else {
                                field.items = { type: getZodType(itemType) };
                            }
                        }
                        
                        // Handle nested object types
                        if (value._def?.shape && getZodType(value) === 'object') {
                            const nestedProperties: Record<string, any> = {};
                            const nestedShape = value._def.shape();
                            Object.entries(nestedShape).forEach(([nestedKey, nestedValue]: [string, any]) => {
                                nestedProperties[nestedKey] = {
                                    type: getZodType(nestedValue),
                                    description: nestedValue.description || nestedValue._def?.description || `${nestedKey} field`
                                };
                            });
                            field.properties = nestedProperties;
                        }
                        
                        properties[key] = field;
                    });
                }
            }
        } catch (error) {
            console.warn(`Error extracting parameters for tool ${toolId}:`, error);
            // Fallback for tools with complex schemas
            properties['parameters'] = {
                type: 'object',
                description: 'Tool parameters (schema extraction failed)'
            };
        }
        
        return { properties, required };
    };
    
    const getZodType = (zodField: any): string => {
        if (!zodField || !zodField._def) return 'any';
        
        const typeName = zodField._def.typeName;
        switch (typeName) {
            case 'ZodString': return 'string';
            case 'ZodNumber': return 'number';
            case 'ZodBoolean': return 'boolean';
            case 'ZodArray': return 'array';
            case 'ZodObject': return 'object';
            case 'ZodEnum': return 'enum';
            case 'ZodOptional': return getZodType(zodField._def.innerType);
            case 'ZodAny': return 'any';
            case 'ZodUnion': return 'union';
            case 'ZodLiteral': return 'literal';
            default: return 'any';
        }
    };
    
    const parameterInfo = extractParameterInfo(schema);
    

    
    return {
        id: toolId,
        description: tool.description || `${toolId} tool`,
        parameters: {
            type: 'object',
            properties: parameterInfo.properties,
            required: parameterInfo.required
        },

    };
};
// Generate detailed tool information for system prompts
export const generateDetailedAgentToolsInfo = (agentToolSpec: Record<string, any>[]): ToolDetails[] => {
    const toolDetails: ToolDetails[] = [];

    agentToolSpec.forEach((sentTool) => {
        const toolObject = availableTools[sentTool.id];
        if (toolObject) {
            const details = extractToolDetails(sentTool.id, toolObject);
            toolDetails.push(details);
        }
    });

    return toolDetails;
}