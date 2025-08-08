import type { FlowNode } from '../../types'
import { fetchUserTablesForConfig } from '@/composables/dashboard/assistant/agents/tools/list'



const isAllRowsDisabled = (formValues: Record<string, any>) => {
    const value = formValues.fieldAllRows
    // Handle both boolean true and string 'true'
    return value === true || value === 'true'
}

export const tableActionNodes:FlowNode[] = [
        {
        node_id: 'TABLE',
        icon: '/icons/table.svg',
        name: 'Table',
        description: 'Interact with your database tables',
        type: 'action',
        provider: 'GOALMATIC',
        category: 'DATABASE',
        children: [
            {
                node_id: 'TABLE_READ',
                type: 'action',
                icon: '/icons/table.svg',
                name: 'Read Table',
                description: 'Read records from a table',
                isTestable: true,
                props: [
                    {
                        name: 'Table',
                        key: 'id',
                        type: 'searchableSelect',
                        required: true,
                        description: 'Select the table to read from',
                        cloneable: false,
                        loadOptions: fetchUserTablesForConfig,
                        loadingText: 'Loading tables...',
                        searchPlaceholder: 'Search tables...',
                        minSearchLength: 0
                    },
                    {
                        name: 'Fetch All Rows',
                        key: 'fieldAllRows',
                        type: 'select',
                        options: [
                            { name: 'False', value: false },
                            { name: 'True', value: true }
                        ],
                        required: false,
                        description: 'When enabled, retrieves all rows (disables limit, sort options)',
                        cloneable: true
                    },
                    {
                        name: 'Limit',
                        key: 'limit',
                        type: 'number',
                        required: false,
                        description: 'Maximum number of records to retrieve (default: 10)',
                        cloneable: true,
                        disabledFunc: isAllRowsDisabled
                    },
                    {
                        name: 'Sort Field',
                        key: 'sortField',
                        type: 'text',
                        required: false,
                        description: 'Field name to sort by (default: created_at)',
                        cloneable: true,
                        disabledFunc: isAllRowsDisabled
                    },
                    {
                        name: 'Sort Order',
                        key: 'sortOrder',
                        type: 'select',
                        options: [
                            { name: 'Ascending', value: 'asc' },
                            { name: 'Descending', value: 'desc' }
                        ],
                        required: false,
                        description: 'Sort order (default: desc)',
                        cloneable: true,
                        disabledFunc: isAllRowsDisabled
                    }
                ],
                expectedOutput: [
                    {
                        name: 'Success',
                        key: 'success',
                        type: 'boolean',
                        description: 'Whether the operation completed successfully'
                    },
                    {
                        name: 'Records',
                        key: 'records',
                        type: 'array',
                        description: 'Array of records retrieved from the table'
                    },
                    {
                        name: 'Total Records',
                        key: 'totalRecords',
                        type: 'number',
                        description: 'Number of records retrieved'
                    },
                    {
                        name: 'Table ID',
                        key: 'tableId',
                        type: 'string',
                        description: 'ID of the table that was queried'
                    }
                ]
            },
            {
                node_id: 'TABLE_CREATE',
                type: 'action',
                icon: '/icons/table.svg',
                name: 'Create Record',
                description: 'Create new records in a table using AI-automated data generation',
                props: [
                    {
                        name: 'Table',
                        key: 'tableId',
                        type: 'searchableSelect',
                        required: true,
                        description: 'Select the table to add the record to',
                        cloneable: false,
                        loadOptions: fetchUserTablesForConfig,
                        loadingText: 'Loading tables...',
                        searchPlaceholder: 'Search tables...',
                        minSearchLength: 0
                    },
                    {
                        name: 'Data Context',
                        key: 'dataContext',
                        type: 'mentionTextarea',
                        required: true,
                        description: 'Context or instructions for AI to generate the record data (can reference previous step outputs)',
                        ai_enabled: false,
                        cloneable: true
                    },
                    {
                        name: 'AI Instructions',
                        key: 'aiInstructions',
                        type: 'mentionTextarea',
                        required: false,
                        description: 'Additional instructions for the AI on how to generate the record data',
                        ai_enabled: true,
                        cloneable: true
                    }
                ],
                expectedOutput: [

                ]
            },
            {
                node_id: 'TABLE_UPDATE',
                type: 'action',
                icon: '/icons/table.svg',
                name: 'Update Record',
                description: 'Update an existing record in a table',
                props: [
                    {
                        name: 'Table ID',
                        key: 'tableId',
                        type: 'text',
                        required: true,
                        description: 'ID of the table containing the record',
                        cloneable: false
                    },
                    {
                        name: 'Record ID',
                        key: 'recordId',
                        type: 'text',
                        required: true,
                        description: 'ID of the record to update',
                        cloneable: false
                    },
                    {
                        name: 'Record Data',
                        key: 'recordData',
                        type: 'textarea',
                        required: true,
                        description: 'JSON object with updated field values',
                        ai_enabled: true,
                        cloneable: true
                    }
                ],
                expectedOutput: [
                    {
                        name: 'Success',
                        key: 'success',
                        type: 'boolean',
                        description: 'Whether the record was updated successfully'
                    },
                    {
                        name: 'Message',
                        key: 'message',
                        type: 'string',
                        description: 'Success message for the update operation'
                    },
                    {
                        name: 'Updated Record',
                        key: 'record',
                        type: 'object',
                        description: 'The updated record data'
                    }
                ]
            },
            {
                node_id: 'TABLE_DELETE',
                type: 'action',
                icon: '/icons/table.svg',
                name: 'Delete Record',
                description: 'Delete a record from a table',
                props: [
                    {
                        name: 'Table ID',
                        key: 'tableId',
                        type: 'text',
                        required: true,
                        description: 'ID of the table containing the record',
                        cloneable: false
                    },
                    {
                        name: 'Record ID',
                        key: 'recordId',
                        type: 'text',
                        required: true,
                        description: 'ID of the record to delete',
                        cloneable: false
                    }
                ],
                expectedOutput: [
                    {
                        name: 'Success',
                        key: 'success',
                        type: 'boolean',
                        description: 'Whether the record was deleted successfully'
                    },
                    {
                        name: 'Message',
                        key: 'message',
                        type: 'string',
                        description: 'Success message for the delete operation'
                    },
                    {
                        name: 'Deleted Record',
                        key: 'record',
                        type: 'object',
                        description: 'Information about the deleted record'
                    }
                ]
            }
        ]
    }
]
