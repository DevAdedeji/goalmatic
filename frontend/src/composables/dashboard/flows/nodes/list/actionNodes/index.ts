import { FlowNode } from '../../types'
import { messagingActionNodes } from './messaging'
import { googleCalendarActionNodes } from './googleCalendar'
import { gmailActionNodes } from './gmail'
import { webActionNodes } from './web'
// import { tableActionNodes } from './table'

export const flowActionNodes: FlowNode[] = [
	...messagingActionNodes,
	...googleCalendarActionNodes,
	...gmailActionNodes,
	...webActionNodes
	// ...tableActionNodes
]
