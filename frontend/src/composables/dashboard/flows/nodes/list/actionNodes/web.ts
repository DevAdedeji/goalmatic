import type { FlowNode } from '../../types'

// Validation function for extractor function
const validateExtractorFunction = (value: any): { valid: boolean; message?: string } => {
    // Allow empty values since it's optional
    if (!value || value.trim() === '') {
        return { valid: true }
    }

    try {
        const functionString = value.trim()

        // Check for basic function patterns
        const isFunctionDeclaration = /^function\s*\([^)]*\)\s*\{[\s\S]*\}$/.test(functionString)
        const isArrowFunction = /^\([^)]*\)\s*=>\s*[\s\S]*$/.test(functionString) || /^[a-zA-Z_$][a-zA-Z0-9_$]*\s*=>\s*[\s\S]*$/.test(functionString)

        if (!isFunctionDeclaration && !isArrowFunction) {
            return {
                valid: false,
                message: 'Must be a valid JavaScript function. Example: (content) => { return content.split("\\n")[0]; }'
            }
        }

        // Basic syntax checks
        if (functionString.includes('function') && (!functionString.includes('{') || !functionString.includes('}'))) {
            return {
                valid: false,
                message: 'Function declaration must have opening and closing braces'
            }
        }

        if (functionString.includes('=>') && !functionString.includes('(')) {
            return {
                valid: false,
                message: 'Arrow function must have parameters in parentheses'
            }
        }

        return { valid: true }
    } catch (error) {
        return {
            valid: false,
            message: 'Invalid function format'
        }
    }
}

export const webActionNodes: FlowNode[] = [
    {
        node_id: 'WEB',
        icon: '/icons/globe.svg',
        name: 'Web',
        description: 'Automate web interactions and fetch web content',
        type: 'action',
        provider: 'GOALMATIC',
        category: 'WEB',
        children: [
            {
                node_id: 'WEB_FETCH_CONTENT_EXA',
                type: 'action',
                name: 'Fetch Web Content using Exa',
                description: 'Fetch and extract content from one or more webpages using Exa.ai. For multiple URLs, separate them with commas',
                isTestable: true,
                icon: '/icons/exa.svg',
                props: [
                    {
                        name: 'URL',
                        key: 'url',
                        type: 'text',
                        required: true,
                        description: 'The URL(s) of the webpage(s) to fetch content from. For multiple URLs, separate them with commas',
                        ai_enabled: true,
                        cloneable: true
                    },
                    {
                        name: 'Extractor Function',
                        key: 'extractorFunction',
                        type: 'textarea',
                        required: false,
                        description: 'Optional JavaScript function to extract specific content from each webpage. Function should accept "content" parameter and return extracted content. Example: (content) => { return content.split("\\n")[0]; }',
                        ai_enabled: true,
                        cloneable: true,
                        validate: validateExtractorFunction
                    }
                ],
                outputProps: [
                    {
                        name: 'Content',
                        key: 'content',
                        type: 'text',
                        description: 'The combined extracted content from all webpages'
                    },
                    {
                        name: 'Content by URL',
                        key: 'contentByUrl',
                        type: 'object',
                        description: 'Content organized by URL for individual access'
                    },
                    {
                        name: 'Total Results',
                        key: 'totalResults',
                        type: 'number',
                        description: 'Number of URLs successfully processed'
                    }
                ]
            }
        ]
    }
]
