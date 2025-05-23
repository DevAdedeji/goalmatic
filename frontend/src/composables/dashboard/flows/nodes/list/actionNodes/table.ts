import { FlowNode } from '../../types'



export const tableActionNodes:FlowNode[] = [
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
    }
]
