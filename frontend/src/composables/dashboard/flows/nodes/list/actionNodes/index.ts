import { FlowNode } from '../../types'
import { messagingActionNodes } from './messaging'
// import { tableActionNodes } from './table'

export const flowActionNodes: FlowNode[] = [
	...messagingActionNodes
	// ...tableActionNodes
]
