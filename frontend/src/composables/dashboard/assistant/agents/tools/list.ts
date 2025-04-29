import { agentToolConfigs } from './config'
import { useFetchUserTables } from '@/composables/dashboard/tables/fetch'

// Function to fetch user tables for the dropdown
export const fetchUserTablesForConfig = async () => {
	const { userTables, fetchAllTables } = useFetchUserTables()

	// Fetch tables if not already fetched
	if (!userTables.value.length) {
		await fetchAllTables()
	}

	// Format tables for dropdown
	return userTables.value.map((table) => ({
		name: table.name,
		value: table.id
	}))
}

const availableTools = ref([
	{
		id: 'GOOGLECALENDAR',
		name: 'Google Calendar',
		icon: '/icons/googleCalendar.svg',
		description: 'Manage Google Calendar Events',
		checkStatus: true,
		abilities: [
			{ name: 'Create Events', id: 'GOOGLECALENDAR_CREATE_EVENT', icon: '/icons/googleCalendar.svg', primary_id: 'GOOGLECALENDAR' },
			{ name: 'Read Events', id: 'GOOGLECALENDAR_READ_EVENT', icon: '/icons/googleCalendar.svg', primary_id: 'GOOGLECALENDAR' }
			// { name: 'Update Events', id: 'GOOGLECALENDAR_UPDATE_EVENT', icon: '/icons/googleCalendar.svg' },
			// { name: 'Delete Events', id: 'GOOGLECALENDAR_DELETE_EVENT', icon: '/icons/googleCalendar.svg' }
		]
	},

	{
		id: 'DATETIME',
		name: 'Date Time',
		icon: '/icons/dateTime.svg',
		description: 'Get the current date and time',
		checkStatus: false,
		abilities: [
			{ name: 'Get Current Date Time', id: 'DATETIME_TOOL', icon: '/icons/dateTime.svg', primary_id: 'DATETIME' }
		]
	},
	{
		id: 'GOOGLESEARCH',
		name: 'Google Search',
		icon: '/icons/googleSearch.svg',
		description: 'Search the web',
		checkStatus: false,
		abilities: [
			{ name: 'Search the web', id: 'GOOGLESEARCH_TOOL', icon: '/icons/googleSearch.svg', primary_id: 'GOOGLESEARCH' }
		]
	},
	{
		id: 'TABLE',
		name: 'Table Manager',
		icon: '/icons/table.svg',
		description: 'Manage your table records',
		checkStatus: false,
		config: [
			{
				name: 'Selected Table',
				key: 'selected_table_id',
				type: 'SELECT',
				required: true,
				options: fetchUserTablesForConfig
			}
		],
		abilities: [
			{ name: 'Read Records', id: 'TABLE_READ', icon: '/icons/table.svg', primary_id: 'TABLE' },
			{ name: 'Create Record', id: 'TABLE_CREATE', icon: '/icons/table.svg', primary_id: 'TABLE' },
			{ name: 'Update Record', id: 'TABLE_UPDATE', icon: '/icons/table.svg', primary_id: 'TABLE' },
			{ name: 'Delete Record', id: 'TABLE_DELETE', icon: '/icons/table.svg', primary_id: 'TABLE' }
		]
	}
])


export const formattedAvailableTools = (UserIntegrations: Record<string, any>[]) => {
	return availableTools.value.map((tool) => {
		return {
			...tool,
			status: tool.checkStatus ? UserIntegrations.some((userIntegration: Record<string, any>) => userIntegration.integration_id === tool.id) : true,
			config: !tool.config?.length
				? false
				: tool.config.map((config: Record<string, any>) => {
					return {
						...config,
						value: UserIntegrations.find((userIntegration: Record<string, any>) => userIntegration.integration_id === tool.id)?.[config.key]
					}
				})
		}
	})
}

export const isConfigSet = (tool: any) => {
	if (!tool.config || tool.config.length === 0) return true
	const storedConfig = (agentToolConfigs.value?.[tool.id]) || {}
	return tool.config.every((field: any) => {
		if (field.required) {
			return storedConfig[field.key] != null && storedConfig[field.key] !== ''
		}
		return true
	})
}


