import type { FlowNode } from '../../types'

export const webActionNodes: FlowNode[] = [
    {
        node_id: 'WEB',
        icon: '/icons/google.svg',
        name: 'Web',
        description: 'Automate web interactions and fetch web content',
        type: 'action',
        provider: 'GOALMATIC',
        category: 'WEB',
        children: [
            {
                node_id: 'WEB_FETCH_CONTENT',
                type: 'action',
                name: 'Fetch Web Content',
                description: 'Fetch and extract content from a webpage using Exa.ai',
                props: [
                    {
                        name: 'URL',
                        key: 'url',
                        type: 'text',
                        required: true,
                        description: 'The URL of the webpage to fetch content from',
                        ai_enabled: true,
                        cloneable: true
                    },
                    {
                        name: 'Max Characters',
                        key: 'maxCharacters',
                        type: 'number',
                        required: false,
                        description: 'Maximum number of characters to extract (default: 10000)',
                        cloneable: true
                    },
                    {
                        name: 'Include Highlights',
                        key: 'includeHighlights',
                        type: 'checkbox',
                        required: false,
                        description: 'Extract relevant highlights from the content',
                        cloneable: true
                    },
                    {
                        name: 'Include Summary',
                        key: 'includeSummary',
                        type: 'checkbox',
                        required: false,
                        description: 'Generate a summary of the webpage content',
                        cloneable: true
                    }
                ]
            }
        ]
    }
]
