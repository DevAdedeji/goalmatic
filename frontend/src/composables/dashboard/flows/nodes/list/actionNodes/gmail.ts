import { FlowNode } from '../../types'

export const gmailActionNodes: FlowNode[] = [
    {
        node_id: 'GMAIL',
        icon: '/icons/mail.svg',
        name: 'Gmail',
        description: 'Send and manage emails through Gmail',
        type: 'action',
        provider: 'GOOGLE',
        category: 'EMAIL',
        children: [
            {
                node_id: 'GMAIL_SEND_EMAIL',
                type: 'action',
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
                ]
            },
            {
                node_id: 'GMAIL_READ_EMAILS',
                type: 'action',
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
                ]
            },
            {
                node_id: 'GMAIL_CREATE_DRAFT',
                type: 'action',
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
                ]
            }
        ]
    }
]
