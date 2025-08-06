import { FlowNode } from '../../types'
import { validateScheduleDate, validateScheduleTime, getDefaultDateValue, getDefaultTimeValue } from '../../validation'
import { timezones, getDefaultTimezone } from '@/composables/helpers/timezone'

export const scheduleTriggerNodes: FlowNode[] = [
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
                type: 'trigger',
                icon: '/icons/dateTime.svg',
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
                        value: getDefaultDateValue,
                        cloneable: false
                    },
                    {
                        name: 'Time',
                        key: 'time',
                        type: 'time',
                        required: true,
                        description: 'The time to run the flow (must be at least 5 minutes in the future)',
                        validate: validateScheduleTime,
                        value: getDefaultTimeValue,
                        cloneable: true
                    },
                    {
                        name: 'Timezone',
                        key: 'timezone',
                        type: 'select',
                        required: true,
                        description: 'The timezone for the scheduled time',
                        options: timezones,
                        value: getDefaultTimezone,
                        cloneable: true
                    }
                ],
                expectedOutput: [
                    {
                        key: 'date',
                        name: 'Scheduled Date',
                        type: 'text',
                        description: 'The date when the flow was scheduled to run'
                    },
                    {
                        key: 'time',
                        name: 'Scheduled Time',
                        type: 'text',
                        description: 'The time when the flow was scheduled to run'
                    },
                    {
                        key: 'timezone',
                        name: 'Timezone',
                        type: 'text',
                        description: 'The timezone for the scheduled time'
                    },
                    {
                        key: 'scheduled_at',
                        name: 'Scheduled At',
                        type: 'text',
                        description: 'The full timestamp when the flow was scheduled to run'
                    }
                ]
            },
            {
                node_id: 'SCHEDULE_INTERVAL',
                type: 'trigger',
                icon: '/icons/dateTime.svg',
                name: 'Schedule Interval',
                description: 'Schedule a flow to run at a specific interval',
                props: [
                    {
                        name: 'Schedule Input',
                        key: 'Input',
                        type: 'text',
                        required: true,
                        description: 'Describe how often you want this to run (e.g. 12pm every week days)',
                        cloneable: true
                    },
                    {
                        name: 'CRON Expression',
                        key: 'cron',
                        type: 'text',
                        required: true,
                        description: 'The generated CRON expression',
                        disabled: true,
                        cloneable: true
                    },
                    {
                        name: 'Plain English Description',
                        key: 'PlainText',
                        type: 'text',
                        required: true,
                        description: 'A plain English description of the schedule',
                        disabled: true,
                        cloneable: true
                    }
                ],
                expectedOutput: [
                    {
                        key: 'interval',
                        name: 'Interval',
                        type: 'text',
                        description: 'The interval configuration'
                    },
                    {
                        key: 'interval_type',
                        name: 'Interval Type',
                        type: 'text',
                        description: 'The type of interval (e.g., daily, weekly)'
                    },
                    {
                        key: 'start_date',
                        name: 'Start Date',
                        type: 'text',
                        description: 'When the interval schedule started'
                    },
                    {
                        key: 'end_date',
                        name: 'End Date',
                        type: 'text',
                        description: 'When the interval schedule will end (if applicable)'
                    },
                    {
                        key: 'next_run',
                        name: 'Next Run',
                        type: 'text',
                        description: 'When the next execution is scheduled'
                    }
                ]
            }
        ]
    }
]
