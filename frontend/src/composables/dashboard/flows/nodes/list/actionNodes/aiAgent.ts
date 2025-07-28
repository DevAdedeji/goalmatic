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
        node_id: 'AI_AGENT_PROCESS',
        type: 'action',
        name: 'Agent Process',
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
          },
          {
            name: 'Expected Output Format',
            key: 'outputFormat',
            type: 'select',
            options: [
              { name: 'Text Response', value: 'text' },
              { name: 'JSON Object', value: 'json' },
              { name: 'Array/List', value: 'array' }
            ],
            required: false,
            description: 'Expected format of the agent\'s response',
            cloneable: true
          }
        ]
      }
    ]
  }
]
