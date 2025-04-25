import { availableTools } from "./list";
import type { ToolSet } from 'ai';



export const generateAgentTools =  (agentToolSpec: Record<string, any>[]) => { 
    const includedTools: ToolSet = {}
    
    agentToolSpec.forEach((sentTool) => {
        const toolObject = availableTools[sentTool.id]
        if (toolObject) {
            includedTools[toolObject.id] = toolObject.tool
        }
    })


    return includedTools
}