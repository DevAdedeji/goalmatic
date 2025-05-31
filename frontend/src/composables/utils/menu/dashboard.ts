import { Settings, Grid3X3, FileSpreadsheetIcon, Workflow, Megaphone, Headset } from 'lucide-vue-next'

import Bot from '@/assets/icons/Bot.vue'


export const dashboardRoutes = () => [

		{
		icon: Bot,
		name: 'Agents',
		route: '/agents',
		type: 'all',
		main: true,
		subRoutes: [
			{ url: '/', propagate: true },
			{ url: '/:sessionId', propagate: true }
		]
	},
		{
		icon: Workflow,
		name: 'Flows',
		route: '/flows',
		type: 'all',
		main: true,
		subRoutes: [
			{ url: '/', propagate: true }
		]
	},
		{
		icon: FileSpreadsheetIcon,
		name: 'Tables',
		route: '/tables',
		type: 'all',
		main: true,
		subRoutes: [
			{ url: '/', propagate: true }
		]
	},
	{
		icon: Grid3X3,
		name: 'Integrations',
		route: '/integrations',
		type: 'all',
		main: true
	},
	// {
	// 	icon: Trophy,
	// 	name: 'Leaderboard',
	// 	route: '/leaderboard',
	// 	type: 'all',
	// 	main: true
	// },
	{
		icon: Settings,
		name: 'Settings',
		route: '/settings',
		type: 'all'
	}
]

export const operationalRoutes = () => [
	{
		icon: Megaphone,
		name: 'Refer a Friend',
		route: '/referral',
		type: 'all'
	},
	{
		icon: Headset,
		name: 'Help & Support',
		route: '/support',
		type: 'all'
	}
]
