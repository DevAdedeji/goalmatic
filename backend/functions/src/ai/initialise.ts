import { InvalidPromptError, generateText } from "ai"
import { createGoogleGenerativeAI } from "@ai-sdk/google"
import { generateAgentTools, generateDetailedAgentToolsInfo } from './tools';
import { setUserToolConfig } from ".";
import { HttpsError } from "firebase-functions/https";
import { formatSystemInfo, goals_db } from "../init";


/**
 * Initialize AI chat with conversation history and agent configuration
 *
 * @param history Array of conversation messages
 * @param agent Agent configuration object
 * @param sessionId Chat session ID for logging tool calls
 * @param isImageRequest Whether this is an image request
 * @returns The AI response text
 */
export const initialiseAIChat = async (
    history: any[] = [],
    agent: Record<string, any>,
    sessionId: string,
    isImageRequest: boolean = false
) => {
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

        // Pass the sessionId to generateAgentTools for tool call logging
        const agentTools = generateAgentTools(agent.spec.tools, sessionId);
        console.log(agentTools, 'agentTools');
        const agentSystemInfo = await customSystemInfo(agent.spec.tools, agent.spec.systemInfo, agent.spec.toolsConfig || {});
        const result = await generateText({
            model: google("gemini-2.5-flash"),
            maxSteps: 25,
            messages: conversationHistory,
            tools: agentTools,
            system: agentSystemInfo,
        });

        return result.text;
    } catch (error) {
        if (InvalidPromptError.isInstance(error)) {
            throw new HttpsError('invalid-argument', error.message);
        }
        throw error;
    }
};


const customSystemInfo = async (agentToolSpec: Record<string, any>[], agentSystemInfo: string, toolsConfig: Record<string, any>) => {
    const formattedAgentSystemInfo = formatSystemInfo(agentSystemInfo);

    // Generate detailed tool information dynamically
    const detailedToolsInfo = generateDetailedAgentToolsInfo(agentToolSpec);

    const toolsSection = detailedToolsInfo.length > 0 ? detailedToolsInfo : 'No tools available';

    // Inject selected table schema into the prompt if configured
    let selectedTableSection = '';
    try {
        const selectedTableId = toolsConfig?.TABLE?.selected_table_id;
        if (selectedTableId) {
            const tableSnap = await goals_db.collection('tables').doc(String(selectedTableId)).get();
            const tableData = tableSnap.exists ? tableSnap.data() as any : null;
            const fields: Array<any> = tableData?.fields || [];
            if (fields.length > 0) {
                const fieldLines = fields.map(f => {
                    const base = `- ${f.id}${f.name && f.name !== f.id ? ` (aka: ${f.name})` : ''} — type: ${f.type}${f.required ? ', required' : ''}`;
                    if (f.type === 'select' && Array.isArray(f.options) && f.options.length > 0) {
                        return `${base}, options: [${f.options.join(', ')}]`;
                    }
                    return base;
                }).join('\n');
                const requiredIds = fields.filter(f => f.required).map(f => f.id);
                const selectFields = fields.filter(f => f.type === 'select' && Array.isArray(f.options) && f.options.length > 0)
                    .map(f => `  - ${f.id}: one of [${f.options.join(', ')}]`).join('\n');
                const selectGuidance = selectFields ? `\nselect_field_constraints:\n${selectFields}` : '';
                selectedTableSection = `
<SelectedTable>
id: ${selectedTableId}
name: ${tableData?.name || 'N/A'}
fields (use these field IDs as keys when creating records):
${fieldLines}
required_field_ids_for_create: [${requiredIds.join(', ')}]
creation_guidance: Always construct the 'record' payload using the field IDs above. If user does not specify date/time and such fields are required, call the datetime tool first. Do not invent values for select fields; choose one of the allowed options exactly as listed.
${selectGuidance}
</SelectedTable>`;
            }
        }
    } catch (e) {
        // Non-fatal: if we can't fetch schema, proceed without it
    }

    // Tool-specific guidance (only shown if those tools are included)
    const toolIds = new Set((agentToolSpec || []).map(t => t?.id));
    let toolGuidanceSection = '';
    if (toolIds.has('TABLE_CREATE') || toolIds.has('TABLE_READ')) {
        toolGuidanceSection = `
<ToolGuidance>
If TABLE_CREATE is available: use field IDs from <SelectedTable> for keys, ensure all required_field_ids_for_create are present, and for select fields use only the allowed options. If date/time are required and not provided by the user, first call CURRENT_DATE_TIME_TOOL and use its results.
If TABLE_READ is available: use field names/IDs from <SelectedTable> when building filters; prefer exact field IDs for accuracy.
</ToolGuidance>`;
    }

    return `
    always use the tools provided by the user in the agent configuration AvailableTools. Even if the system prompt says you have access to other tools,
    if it's not in the agent configuration AvailableTools below, you do not have access to it.
    <AvailableTools>
${toolsSection}
    </AvailableTools>
    ${selectedTableSection}
    ${toolGuidanceSection}

    <Agent System Info>
    ${formattedAgentSystemInfo}
    </Agent System Info>
    `
}