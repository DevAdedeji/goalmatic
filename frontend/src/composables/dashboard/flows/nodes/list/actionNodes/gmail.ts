import { FlowNode } from '../../types'

export const gmailActionNodes: FlowNode[] = [
    {
        node_id: 'GMAIL',
        icon: '/icons/gmail.svg',
        name: 'Gmail',
        description: 'Send and manage emails through Gmail',
        type: 'action',
        provider: 'COMPOSIO',
        category: 'EMAIL',
        children: [
            {
                node_id: 'COMPOSIO_GMAIL_SEND_EMAIL',
                type: 'action',
                icon: '/icons/gmail.svg',
                name: 'Send Email',
                description: 'Send an email through Gmail',
                props: [
                    {
                        name: 'Recipient Email',
                        key: 'to',
                        type: 'text',
                        required: true,
                        description: 'Email address of the recipient',
                        ai_enabled: true,
                        cloneable: true
                    },
                    {
                        name: 'Subject',
                        key: 'subject',
                        type: 'text',
                        required: true,
                        description: 'Email subject line',
                        ai_enabled: true,
                        cloneable: true
                    },
                    {
                        name: 'Email Body',
                        key: 'body',
                        type: 'textarea',
                        required: true,
                        description: 'Content of the email',
                        ai_enabled: true,
                        cloneable: true
                    },
                    {
                        name: 'HTML Format',
                        key: 'isHtml',
                        type: 'checkbox',
                        required: false,
                        description: 'Send email as HTML format',
                        cloneable: true
                    }
                ],
                expectedOutput: [
                    {
                        name: 'Success',
                        key: 'success',
                        type: 'boolean',
                        description: 'Whether the email was sent successfully'
                    },
                    {
                        name: 'Message ID',
                        key: 'messageId',
                        type: 'string',
                        description: 'Unique identifier of the sent email'
                    },
                    {
                        name: 'Sent At',
                        key: 'sentAt',
                        type: 'string',
                        description: 'Timestamp when the email was sent'
                    },
                    {
                        name: 'Email Details',
                        key: 'emailDetails',
                        type: 'object',
                        description: 'Complete details of the sent email'
                    }
                ]
            },
            {
                node_id: 'COMPOSIO_GMAIL_READ_EMAILS',
                type: 'action',
                icon: '/icons/gmail.svg',
                name: 'Read Emails',
                description: 'Read emails from Gmail inbox',
                props: [
                    {
                        name: 'Search Query',
                        key: 'query',
                        type: 'text',
                        required: false,
                        description: 'Gmail search query (e.g., "from:example@gmail.com", "is:unread")',
                        ai_enabled: true,
                        cloneable: true
                    },
                    {
                        name: 'Max Results',
                        key: 'maxResults',
                        type: 'number',
                        required: false,
                        description: 'Maximum number of emails to retrieve (default: 10)',
                        cloneable: true
                    }
                ],
                expectedOutput: [
                    {
                        name: 'Success',
                        key: 'success',
                        type: 'boolean',
                        description: 'Whether the emails were retrieved successfully'
                    },
                    {
                        name: 'Emails',
                        key: 'emails',
                        type: 'array',
                        description: 'Array of retrieved emails with their details'
                    },
                    {
                        name: 'Retrieved At',
                        key: 'retrievedAt',
                        type: 'string',
                        description: 'Timestamp when the emails were retrieved'
                    }
                ]
            },
            {
                node_id: 'COMPOSIO_GMAIL_CREATE_DRAFT',
                type: 'action',
                icon: '/icons/gmail.svg',
                name: 'Create Draft',
                description: 'Create a draft email in Gmail',
                props: [
                    {
                        name: 'Recipient Email',
                        key: 'to',
                        type: 'text',
                        required: true,
                        description: 'Email address of the recipient',
                        ai_enabled: true,
                        cloneable: true
                    },
                    {
                        name: 'Subject',
                        key: 'subject',
                        type: 'text',
                        required: true,
                        description: 'Email subject line',
                        ai_enabled: true,
                        cloneable: true
                    },
                    {
                        name: 'Email Body',
                        key: 'body',
                        type: 'textarea',
                        required: true,
                        description: 'Content of the email draft',
                        ai_enabled: true,
                        cloneable: true
                    },
                    {
                        name: 'HTML Format',
                        key: 'isHtml',
                        type: 'checkbox',
                        required: false,
                        description: 'Create draft as HTML format',
                        cloneable: true
                    }
                ],
                expectedOutput: [
                    {
                        name: 'Success',
                        key: 'success',
                        type: 'boolean',
                        description: 'Whether the draft was created successfully'
                    },
                    {
                        name: 'Draft ID',
                        key: 'draftId',
                        type: 'string',
                        description: 'Unique identifier of the created draft'
                    },
                    {
                        name: 'Created At',
                        key: 'createdAt',
                        type: 'string',
                        description: 'Timestamp when the draft was created'
                    },
                    {
                        name: 'Draft Details',
                        key: 'draftDetails',
                        type: 'object',
                        description: 'Complete details of the created draft'
                    }
                ]
            }
        ]
    }
]
