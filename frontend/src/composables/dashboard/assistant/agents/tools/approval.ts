import { availableTools } from './list'
import { agentToolConfigs } from './config'

/**
 * Checks if an agent has tools that require configuration
 * @param agent The agent to check
 * @returns Object with hasRequiredTools and toolsRequiringConfig
 */
export const checkAgentToolRequirements = (agent: Record<string, any>) => {
  // Check if agent has tools
  if (!agent?.spec?.tools || agent.spec.tools.length === 0) {
    return {
      hasRequiredTools: false,
      toolsRequiringConfig: []
    }
  }

  // Get the available tools that require configuration
  const toolsRequiringConfig = agent.spec.tools.filter((agentTool: Record<string, any>) => {
    // For abilities, we need to check the primary_id
    const toolId = agentTool.primary_id || agentTool.id

    // Find the corresponding tool definition from availableTools
    const toolDefinition = availableTools.value.find(
      (availableTool: Record<string, any>) => availableTool.id === toolId
    )
    // If tool definition has config requirements
    if (toolDefinition && toolDefinition.config) {
      // Check if the tool is already configured in agentToolConfigs
      const isConfigured = agentToolConfigs.value[toolId] &&
                          toolDefinition.config.every((field: any) => {
                            if (field.required) {
                              const value = agentToolConfigs.value[toolId][field.key]
                              return value !== undefined && value !== null && value !== ''
                            }
                            return true
                          })

      // If the tool is already configured, don't require configuration
      if (isConfigured) {
        return false
      }

      // Otherwise, require configuration
      return true
    }

    return false
  })

  return {
    hasRequiredTools: toolsRequiringConfig.length > 0,
    toolsRequiringConfig: toolsRequiringConfig.map((agentTool: Record<string, any>) => {
      // For abilities, we need to use the primary_id
      const toolId = agentTool.primary_id || agentTool.id

      // Find the corresponding tool definition to get the config
      const toolDefinition = availableTools.value.find(
        (availableTool: Record<string, any>) => availableTool.id === toolId
      )

      // Return a merged tool with the config from the definition
      return {
        ...agentTool,
        id: toolId, // Ensure we're using the correct ID for configuration
        config: toolDefinition?.config || [],
        name: toolDefinition?.name || agentTool.name,
        icon: toolDefinition?.icon || agentTool.icon,
        description: toolDefinition?.description || ''
      }
    })
  }
}

/**
 * Initializes tool configurations from an agent
 * @param agent The agent to initialize configs from
 */
export const initializeToolConfigs = (agent: Record<string, any>) => {
  // When cloning an agent, we should initialize all tool configs with empty values
  // instead of copying from the original agent, since those belong to the original owner

  // Initialize any tools that need configuration
  if (agent?.spec?.tools) {
    agent.spec.tools.forEach((tool: Record<string, any>) => {
      // For abilities, we need to use the primary_id
      const toolId = tool.primary_id || tool.id

      // Find the corresponding tool definition
      const toolDefinition = availableTools.value.find(
        (availableTool: Record<string, any>) => availableTool.id === toolId
      )

      // If the tool has configuration requirements
      if (toolDefinition?.config) {
        // Initialize with empty values
        agentToolConfigs.value[toolId] = toolDefinition.config.reduce((acc: Record<string, any>, field: any) => {
          acc[field.key] = field.value || ''
          return acc
        }, {})
      }
    })
  }
}
