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
                ]
            },
            {
                node_id: 'GOOGLECALENDAR_UPDATE_EVENT',
                type: 'action',
                name: 'Update Event',
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
                ]
            },
            {
                node_id: 'GOOGLECALENDAR_DELETE_EVENT',
                type: 'action',
                name: 'Delete Event',
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
                ]
            }
        ]
    }
]
