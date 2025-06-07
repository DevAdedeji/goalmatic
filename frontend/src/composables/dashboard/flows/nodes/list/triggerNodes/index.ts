import { FlowNode } from '../../types'
import { scheduleTriggerNodes } from './schedule'

export const flowTriggerNodes: FlowNode[] = [
	...scheduleTriggerNodes
]
