import type { FlowNode } from '../../types'
import { useFetchAgents, useFetchUserAgents } from '@/composables/dashboard/assistant/agents/fetch'
import { availableTools } from '@/composables/dashboard/assistant/agents/tools/list'


// Function to fetch user agents for dropdown
const fetchUserAgentsForConfig = async () => {
  const { fetchAllAgents, fetchedAllAgents } = useFetchAgents()
  const { fetchUserAgents, fetchedUserAgents } = useFetchUserAgents()
  await fetchAllAgents()
  await fetchUserAgents()

  // Map agents to required format
  const allAgents = [...fetchedAllAgents.value, ...fetchedUserAgents.value].map((agent) => ({
    id: agent.id,
    name: agent.name,
    description: agent.description || 'AI agent for processing and analysis',
    tools: agent.spec?.tools || [],
    isUserAgent: !agent.public
  }))

  // Remove duplicates based on agent ID
  const uniqueAgents = allAgents.filter((agent, index, self) =>
    index === self.findIndex((a) => a.id === agent.id)
  )
  return uniqueAgents
}

// Function to fetch available tools for Ask AI node
const fetchAvailableToolsForConfig = async () => {
  // Return formatted tools for multi-select
  return availableTools.value.flatMap((tool) =>
    tool.abilities.map((ability) => ({
      id: ability.id,
      name: `${tool.name} - ${ability.name}`,
      description: tool.description,
      icon: ability.icon,
      primary_id: ability.primary_id,
      checkStatus: tool.checkStatus
    }))
  )
}

export const aiActionNodes: FlowNode[] = [
  {
    node_id: 'AI',
    icon: '/icons/ai.svg',
    name: 'AI',
    description: 'AI-powered data processing and analysis',
    type: 'action',
    provider: 'GOALMATIC',
    category: 'AI',
    children: [
      {
        node_id: 'ASK_AI',
        type: 'action',
        name: 'Ask AI',
        description: 'Ask AI a question or request text generation with tool integration capabilities',
        icon: '/icons/ai.svg',
        props: [
          {
            name: 'Mode',
            key: 'mode',
            type: 'select',
            options: [
              { name: 'Simple AI (No Tools)', value: 'simple' },
              { name: 'AI with Tools', value: 'tools' }
            ],
            required: true,
            description: 'Choose whether to use simple AI or AI with tool integration',
            cloneable: true,
            value: 'simple'
          },
          {
            name: 'Available Tools',
            key: 'selectedTools',
            type: 'textarea',
            required: false,
            description: 'Enter tool IDs separated by commas (e.g., GOOGLECALENDAR_CREATE_EVENT, TABLE_READ, SEARCH_TOOL). Available tools: GOOGLECALENDAR_CREATE_EVENT, GOOGLECALENDAR_READ_EVENT, GOOGLECALENDAR_UPDATE_EVENT, GOOGLECALENDAR_DELETE_EVENT, TABLE_READ, TABLE_CREATE, TABLE_UPDATE, TABLE_DELETE, SEARCH_TOOL, CURRENT_DATE_TIME_TOOL, SEND_WHATSAPP_MESSAGE_TOOL, SEND_EMAIL_TOOL, GMAIL_SEND_EMAIL, GMAIL_READ_EMAILS, GMAIL_CREATE_DRAFT',
            cloneable: true,
            hiddenFunc: (formValues: Record<string, any>) => formValues.mode !== 'tools'
          },
          {
            name: 'Input Data',
            key: 'inputData',
            type: 'mentionTextarea',
            required: true,
            description: 'Data to be processed by the AI (can reference previous step outputs)',
            ai_enabled: false,
            cloneable: true
          },
          {
            name: 'Custom Instructions',
            key: 'customInstructions',
            type: 'textarea',
            required: false,
            description: 'Additional instructions or context for the AI (will be added to the system prompt)',
            ai_enabled: true,
            cloneable: true
          }
        ],
        expectedOutput: [
          {
            name: 'Success',
            key: 'success',
            type: 'boolean',
            description: 'Whether the operation completed successfully'
          },
          {
            name: 'AI Response',
            key: 'aiResponse',
            type: 'string',
            description: 'The AI\'s response to your prompt'
          },
          {
            name: 'Tool Results',
            key: 'toolResults',
            type: 'array',
            description: 'Results from any tools used during processing (if tools mode is enabled)'
          },
          {
            name: 'Processed Data',
            key: 'processedData',
            type: 'object',
            description: 'Additional processed data from the AI response (if applicable)'
          },
          {
            name: 'Session ID',
            key: 'sessionId',
            type: 'string',
            description: 'Unique session identifier for this request'
          }
        ]
      },
      {
        node_id: 'ASK_AGENT',
        type: 'action',
        name: 'Ask Agent',
        description: 'Process data using a selected AI agent with custom configuration',
        icon: '/icons/ai.svg',
        props: [
          {
            name: 'Agent',
            key: 'selectedAgent',
            type: 'searchableSelect',
            required: true,
            description: 'Select an AI agent to process the data',
            cloneable: false,
            loadOptions: fetchUserAgentsForConfig,
            loadingText: 'Loading agents...',
            searchPlaceholder: 'Search agents...',
            minSearchLength: 0
          },
          {
            name: 'Input Data',
            key: 'inputData',
            type: 'mentionTextarea',
            required: true,
            description: 'Data to be processed by the AI agent (can reference previous step outputs)',
            ai_enabled: false,
            cloneable: true
          },
          {
            name: 'Custom Instructions',
            key: 'customInstructions',
            type: 'textarea',
            required: false,
            description: 'Additional instructions or context for the agent (will be added to the agent\'s system prompt)',
            ai_enabled: true,
            cloneable: true
          }
        ],
        expectedOutput: [
          {
            name: 'Success',
            key: 'success',
            type: 'boolean',
            description: 'Whether the operation completed successfully'
          },
          {
            name: 'Agent Response',
            key: 'agentResponse',
            type: 'string',
            description: 'Raw response from the AI agent'
          },
          {
            name: 'Processed Data',
            key: 'processedData',
            type: 'object',
            description: 'Additional processed data from the AI response (if applicable)'
          },
          {
            name: 'Agent Info',
            key: 'agentInfo',
            type: 'object',
            description: 'Information about the agent used (id, name, description)'
          },
          {
            name: 'Session ID',
            key: 'sessionId',
            type: 'string',
            description: 'Unique session identifier for this processing request'
          }
        ]
      }
    ]
  }
]
