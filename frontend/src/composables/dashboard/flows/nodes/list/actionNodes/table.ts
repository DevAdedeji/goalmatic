import type { FlowNode } from '../../types'



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
                props: [
                    {
                        name: 'Table ID',
                        key: 'tableId',
                        type: 'text',
                        required: true,
                        description: 'ID of the table to read from',
                        cloneable: false
                    },
                    {
                        name: 'Limit',
                        key: 'limit',
                        type: 'number',
                        required: false,
                        description: 'Maximum number of records to retrieve (default: 10)',
                        cloneable: true
                    },
                    {
                        name: 'Sort Field',
                        key: 'sortField',
                        type: 'text',
                        required: false,
                        description: 'Field name to sort by (default: created_at)',
                        cloneable: true
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
                        cloneable: true
                    }
                ]
            },
            {
                node_id: 'TABLE_CREATE',
                type: 'action',
                icon: '/icons/table.svg',
                name: 'Create Record',
                description: 'Create a new record in a table',
                props: [
                    {
                        name: 'Table ID',
                        key: 'tableId',
                        type: 'text',
                        required: true,
                        description: 'ID of the table to add the record to',
                        cloneable: false
                    },
                    {
                        name: 'Record Data',
                        key: 'recordData',
                        type: 'textarea',
                        required: true,
                        description: 'JSON object with field values for the new record',
                        ai_enabled: true,
                        cloneable: true
                    }
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
                ]
            }
        ]
    }
]
