import { FlowNode } from '../../types'
import { messagingActionNodes } from './messaging'
import { googleCalendarActionNodes } from './googleCalendar'
// import { tableActionNodes } from './table'

export const flowActionNodes: FlowNode[] = [
	...messagingActionNodes,
	...googleCalendarActionNodes
	// ...tableActionNodes
]
