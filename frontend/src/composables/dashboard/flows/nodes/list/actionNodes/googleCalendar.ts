import type { FlowNode } from '../../types'

export const googleCalendarActionNodes: FlowNode[] = [
    {
        node_id: 'GOOGLECALENDAR',
        icon: '/icons/googleCalendar.svg',
        name: 'Google Calendar',
        description: 'Manage Google Calendar events',
        type: 'action',
        provider: 'GOOGLE',
        category: 'CALENDAR',
        children: [
            {
                node_id: 'GOOGLECALENDAR_CREATE_EVENT',
                type: 'action',
                name: 'Create Event',
                icon: '/icons/googleCalendar.svg',
                description: 'Create a new event in Google Calendar',
                props: [
                    {
                        name: 'Event Title',
                        key: 'summary',
                        type: 'text',
                        required: true,
                        description: 'Title of the calendar event',
                        ai_enabled: true,
                        cloneable: true
                    },
                    {
                        name: 'Description',
                        key: 'description',
                        type: 'textarea',
                        required: false,
                        description: 'Description of the event',
                        ai_enabled: true,
                        cloneable: true
                    },
                    {
                        name: 'Start Date & Time',
                        key: 'startDateTime',
                        type: 'datetime-local',
                        required: true,
                        description: 'When the event starts',
                        cloneable: true
                    },
                    {
                        name: 'End Date & Time',
                        key: 'endDateTime',
                        type: 'datetime-local',
                        required: true,
                        description: 'When the event ends',
                        cloneable: true
                    }
                ],
                expectedOutput: [
                    {
                        name: 'Success',
                        key: 'success',
                        type: 'boolean',
                        description: 'Whether the event was created successfully'
                    },
                    {
                        name: 'Event ID',
                        key: 'eventId',
                        type: 'string',
                        description: 'Unique identifier of the created event'
                    },
                    {
                        name: 'Created At',
                        key: 'createdAt',
                        type: 'string',
                        description: 'Timestamp when the event was created'
                    },
                    {
                        name: 'Event Details',
                        key: 'eventDetails',
                        type: 'object',
                        description: 'Complete details of the created event'
                    }
                ]
            },
            {
                node_id: 'GOOGLECALENDAR_UPDATE_EVENT',
                type: 'action',
                name: 'Update Event',
                icon: '/icons/googleCalendar.svg',
                description: 'Update an existing event in Google Calendar',
                props: [
                    {
                        name: 'Event ID',
                        key: 'eventId',
                        type: 'text',
                        required: true,
                        description: 'ID of the event to update',
                        cloneable: false
                    },
                    {
                        name: 'Event Title',
                        key: 'summary',
                        type: 'text',
                        required: false,
                        description: 'New title of the calendar event',
                        ai_enabled: true,
                        cloneable: true
                    },
                    {
                        name: 'Description',
                        key: 'description',
                        type: 'textarea',
                        required: false,
                        description: 'New description of the event',
                        ai_enabled: true,
                        cloneable: true
                    },
                    {
                        name: 'Start Date & Time',
                        key: 'startDateTime',
                        type: 'datetime-local',
                        required: false,
                        description: 'New start time for the event',
                        cloneable: true
                    },
                    {
                        name: 'End Date & Time',
                        key: 'endDateTime',
                        type: 'datetime-local',
                        required: false,
                        description: 'New end time for the event',
                        cloneable: true
                    }
                ],
                expectedOutput: [
                    {
                        name: 'Success',
                        key: 'success',
                        type: 'boolean',
                        description: 'Whether the event was updated successfully'
                    },
                    {
                        name: 'Event ID',
                        key: 'eventId',
                        type: 'string',
                        description: 'Unique identifier of the updated event'
                    },
                    {
                        name: 'Updated At',
                        key: 'updatedAt',
                        type: 'string',
                        description: 'Timestamp when the event was updated'
                    },
                    {
                        name: 'Event Details',
                        key: 'eventDetails',
                        type: 'object',
                        description: 'Complete details of the updated event'
                    }
                ]
            },
            {
                node_id: 'GOOGLECALENDAR_DELETE_EVENT',
                type: 'action',
                name: 'Delete Event',
                icon: '/icons/googleCalendar.svg',
                description: 'Delete an existing event from Google Calendar',
                props: [
                    {
                        name: 'Event ID',
                        key: 'eventId',
                        type: 'text',
                        required: true,
                        description: 'ID of the event to delete',
                        cloneable: false
                    }
                ],
                expectedOutput: [
                    {
                        name: 'Success',
                        key: 'success',
                        type: 'boolean',
                        description: 'Whether the event was deleted successfully'
                    },
                    {
                        name: 'Event ID',
                        key: 'eventId',
                        type: 'string',
                        description: 'Unique identifier of the deleted event'
                    },
                    {
                        name: 'Deleted At',
                        key: 'deletedAt',
                        type: 'string',
                        description: 'Timestamp when the event was deleted'
                    },
                    {
                        name: 'Message',
                        key: 'message',
                        type: 'string',
                        description: 'Confirmation message for the deletion'
                    }
                ]
            }
        ]
    }
]
