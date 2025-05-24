import type { FlowNode } from '../../types'


export const messagingActionNodes:FlowNode[] = [

    {
        node_id: 'MESSAGING',
        icon: '/icons/mail.svg',
        name: 'Messaging',
        description: 'Send messages via WhatsApp or Email',
        type: 'action',
        provider: 'GOALMATIC',
        category: 'MESSAGING',
        children: [
            {
                node_id: 'SEND_WHATSAPP_MESSAGE',
                type: 'action',
                name: 'Send WhatsApp Message',
                description: 'Send a message via WhatsApp',
                props: [
                    {
                        name: 'Message',
                        key: 'message',
                        type: 'mentionTextarea',
                        required: true,
                        description: 'The message content to send',
                        ai_enabled: true
                    },
                    {
                        name: 'Recipient Type',
                        key: 'recipientType',
                        type: 'select',
                        options: [
                            { name: 'User\'s WhatsApp', value: 'user' },
                            { name: 'Custom Phone Number', value: 'custom' }
                        ],
                        required: true,
                        description: 'Send to user\'s linked WhatsApp or a custom phone number'
                    },
                    {
                        name: 'Phone Number',
                        key: 'phoneNumber',
                        type: 'text',
                        required: false,
                        description: 'Phone number with country code (e.g., +1234567890)'
                    }
                ]
            },
            {
                node_id: 'SEND_EMAIL',
                type: 'action',
                name: 'Send Email',
                description: 'Send an email to your linked email address',
                props: [
                    {
                        name: 'Subject',
                        key: 'subject',
                        type: 'text',
                        required: true
                    },
                    {
                        name: 'Email Type',
                        key: 'emailType',
                        type: 'select',
                        options: [
                            { name: 'Plain Text', value: 'plain' },
                            { name: 'HTML', value: 'html' }
                        ],
                        required: true
                    },
                    {
                        name: 'Body',
                        key: 'body',
                        type: 'mentionTextarea',
                        required: true,
                        ai_enabled: true
                    },
                    {
                        name: 'Recipient Email',
                        key: 'recipientEmail',
                        type: 'email',
                        required: true,
                        disabled: true,
                        value: 'USER_EMAIL',
                        description: 'For security reasons, emails will be sent to your account email address only.'
                    }
                ]
            }
        ]
    }
]
