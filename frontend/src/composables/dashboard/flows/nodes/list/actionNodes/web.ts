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
                description: 'Fetch and extract content from a webpage using Playwright',
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
                        name: 'Wait For Selector',
                        key: 'waitForSelector',
                        type: 'text',
                        required: false,
                        description: 'CSS selector to wait for before extracting content (optional)',
                        cloneable: true
                    },
                    {
                        name: 'Extract Text Only',
                        key: 'textOnly',
                        type: 'checkbox',
                        required: false,
                        description: 'Extract only text content, removing HTML tags',
                        cloneable: true
                    },
                    {
                        name: 'Timeout (seconds)',
                        key: 'timeout',
                        type: 'number',
                        required: false,
                        description: 'Maximum time to wait for page load (default: 30 seconds)',
                        cloneable: true
                    },
                    {
                        name: 'User Agent',
                        key: 'userAgent',
                        type: 'text',
                        required: false,
                        description: 'Custom user agent string (optional)',
                        cloneable: true
                    },
                    {
                        name: 'Content',
                        key: 'content',
                        type: 'text',
                        required: false,
                        description: 'Custom content to include in the request (optional)',
                        cloneable: true
                    }
                ]
            }
        ]
    }
]
