import type { FlowNode, FlowNodeProp } from '../types'
import { validateScheduleDate, validateScheduleTime, getDefaultDateValue, getDefaultTimeValue } from './validation'
import { timezones, getDefaultTimezone } from '@/composables/helpers/timezone'



export const flowTriggerNodes: FlowNode[] = [
    {
        node_id: 'SCHEDULE',
        icon: '/icons/dateTime.svg',
        name: 'Schedule',
        description: 'Schedule a flow to run at a specific time or at a specific interval',
        type: 'trigger',
        provider: 'GOALMATIC',
        category: 'DATETIME',
        children: [
            {
                node_id: 'SCHEDULE_TIME',
                name: 'Schedule Time',
                description: 'Schedule a flow to run at a specific time',
                props: [
                    {
                        name: 'Date',
                        key: 'date',
                        type: 'date',
                        required: true,
                        description: 'The date to run the flow (must be today or in the future)',
                        validate: validateScheduleDate,
                        value: getDefaultDateValue
                    },
                    {
                        name: 'Time',
                        key: 'time',
                        type: 'time',
                        required: true,
                        description: 'The time to run the flow (must be at least 5 minutes in the future)',
                        validate: validateScheduleTime,
                        value: getDefaultTimeValue
                    },
                    {
                        name: 'Timezone',
                        key: 'timezone',
                        type: 'select',
                        required: true,
                        description: 'The timezone for the scheduled time',
                        options: timezones,
                        value: getDefaultTimezone
                    }
                ]
            },
            {
                node_id: 'SCHEDULE_INTERVAL',
                name: 'Schedule Interval',
                description: 'Schedule a flow to run at a specific interval',
                props: [
                    {
                        name: 'Describe how often you want this to run',
                        key: 'description',
                        type: 'text',
                        required: true
                    },
                    {
                        name: 'Interval',
                        key: 'interval',
                        type: 'number',
                        required: true
                    },
                    {
                        name: 'Timezone',
                        key: 'timezone',
                        type: 'select',
                        required: true,
                        description: 'The timezone for the scheduled interval',
                        options: timezones,
                        value: getDefaultTimezone
                    }
                ]
            }
        ]
    }
]

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
        node_id: 'SEND_WHATSAPP_MESSAGE',
        icon: '/icons/whatsapp.svg',
        name: 'Send WhatsApp Message',
        description: 'Send a message via WhatsApp',
        type: 'action',
        provider: 'WHATSAPP',
        category: 'MESSAGING',
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
                name: 'Custom Phone Number',
                key: 'customPhoneNumber',
                type: 'text',
                required: false,
                description: 'Phone number with country code (e.g., +1234567890)'

            }
        ]
    },
    {
        node_id: 'SEND_EMAIL',
        icon: '/icons/mail.svg',
        name: 'Send Email',
        description: 'Send an email to your linked email address',
        type: 'action',
        provider: 'GOALMATIC',
        category: 'MESSAGING',
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
    },
    {
        node_id: 'GOOGLECALENDAR',
        icon: '/icons/googleCalendar.svg',
        name: 'Google Calendar',
        description: 'Create, update, or delete events in your Google Calendar',
        type: 'action',
        provider: 'GOOGLE',
        category: 'CALENDAR',
        children: [
            {
                node_id: 'GOOGLECALENDAR_CREATE_EVENT',
                name: 'Create Event',
                description: 'Create a new event in your Google Calendar'
            }
        ]
    }
]


