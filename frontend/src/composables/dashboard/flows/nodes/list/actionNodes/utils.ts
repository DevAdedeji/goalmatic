import type { FlowNode } from '../../types'

// Basic validator for formatter function strings (similar to web.ts extractor)
const validateFormatterFunction = (value: any): { valid: boolean; message?: string } => {
    if (!value || String(value).trim() === '') return { valid: true }

    try {
        const fn = String(value).trim()
        const isFunctionDeclaration = /^function\s*\([^)]*\)\s*\{[\s\S]*\}$/.test(fn)
        const isArrowFunction = /^(\([^)]*\)|[a-zA-Z_$][a-zA-Z0-9_$]*)\s*=>\s*[\s\S]*$/.test(fn)

        if (!isFunctionDeclaration && !isArrowFunction) {
            return { valid: false, message: 'Must be a valid JavaScript function. Example: (input) => { return input.length; }' }
        }
        return { valid: true }
    } catch {
        return { valid: false, message: 'Invalid function format' }
    }
}

export const utilActionNodes: FlowNode[] = [
    {
        node_id: 'UTILS',
        icon: '/icons/gear.svg',
        name: 'Utilities',
        description: 'Helper utilities for transforming data',
        type: 'action',
        provider: 'GOALMATIC',
        category: 'UTILS',
        children: [
            {
                node_id: 'FORMAT_DATA',
                type: 'action',
                name: 'Format Data',
                description: 'Format/transform input data with a custom function and output a string',
                icon: '/icons/format.svg',
                props: [
                    {
                        name: 'Input Data',
                        key: 'inputData',
                        type: 'mentionTextarea',
                        required: true,
                        description: 'Data to be formatted. Can be text, JSON, or a previous step output reference',
                        ai_enabled: false,
                        cloneable: true
                    },
                    {
                        name: 'Formatter Function',
                        key: 'formatterFunction',
                        type: 'textarea',
                        required: true,
                        description: 'A JS function: (input) => string. Example formats arrays/objects into readable text',
                        ai_enabled: true,
                        cloneable: true,
                        validate: validateFormatterFunction
                    }
                ],
                expectedOutput: [
                    { name: 'Success', key: 'success', type: 'boolean', description: 'Whether formatting succeeded' },
                    { name: 'Formatted Text', key: 'formattedText', type: 'string', description: 'Resulting formatted string' },
                    { name: 'Total Items', key: 'totalItems', type: 'number', description: 'If input was an array, the number of items' }
                ]
            }
        ]
    }
]

