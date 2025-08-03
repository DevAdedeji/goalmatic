import type { FlowNode } from '../../types'
import { useFetchAgents, useFetchUserAgents } from '@/composables/dashboard/assistant/agents/fetch'


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
        description: 'Ask AI a question or request text generation with simple prompt-based interaction',
        icon: '/icons/ai.svg',
        props: [
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
