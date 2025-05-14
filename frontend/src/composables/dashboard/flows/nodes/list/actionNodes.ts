import type { FlowNode } from '../types'

export const flowActionNodes: FlowNode[] = [
    {
        node_id: 'TABLE',
        icon: '/icons/table.svg',
        name: 'Table',
        description: 'Manage your table records',
        type: 'action',
        provider: 'GOALMATIC',
        category: 'DATA_MANAGEMENT',
        children: [
            {
                node_id: 'TABLE_READ',
                type: 'action',
                name: 'Read Records',
                description: 'Fetch records from a table with optional filtering',
                props: [
                    {
                        name: 'Table ID',
                        key: 'tableId',
                        type: 'text',
                        required: true,
                        description: 'ID of the table to read from'
                    },
                    {
                        name: 'Record ID',
                        key: 'recordId',
                        type: 'text',
                        required: false,
                        description: 'Optional ID of a specific record to retrieve'
                    },
                    {
                        name: 'Limit',
                        key: 'limit',
                        type: 'number',
                        required: false,
                        description: 'Maximum number of records to return'
                     }
                ]
            },
            {
                node_id: 'TABLE_CREATE',
                type: 'action',
                name: 'Create Record',
                description: 'Create a new record in a table',
                props: [
                    {
                        name: 'Table ID',
                        key: 'tableId',
                        type: 'text',
                        required: true,
                        description: 'ID of the table to add the record to'
                    },
                    {
                        name: 'Record Data',
                        key: 'recordData',
                        type: 'textarea',
                        required: true,
                        description: 'JSON object with field values for the new record'
                    }
                ]
            },
            {
                node_id: 'TABLE_UPDATE',
                type: 'action',
                name: 'Update Record',
                description: 'Update an existing record in a table',
                props: [
                    {
                        name: 'Table ID',
                        key: 'tableId',
                        type: 'text',
                        required: true,
                        description: 'ID of the table containing the record'
                    },
                    {
                        name: 'Record ID',
                        key: 'recordId',
                        type: 'text',
                        required: true,
                        description: 'ID of the record to update'
                    },
                    {
                        name: 'Record Data',
                        key: 'recordData',
                        type: 'textarea',
                        required: true,
                        description: 'JSON object with updated field values'
                    }
                ]
            },
            {
                node_id: 'TABLE_DELETE',
                type: 'action',
                name: 'Delete Record',
                description: 'Delete a record from a table',
                props: [
                    {
                        name: 'Table ID',
                        key: 'tableId',
                        type: 'text',
                        required: true,
                        description: 'ID of the table containing the record'
                    },
                    {
                        name: 'Record ID',
                        key: 'recordId',
                        type: 'text',
                        required: true,
                        description: 'ID of the record to delete'
                    }
                ]
            }
        ]
    },
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
                        type: 'textarea',
                        required: true,
                        description: 'The message content to send'
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
                        type: 'textarea',
                        required: true
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
