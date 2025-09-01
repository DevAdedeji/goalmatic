import { FlowNode } from '../../types'
import { scheduleTriggerNodes } from './schedule'
import { messagingTriggerNodes } from './messaging'

export const flowTriggerNodes: FlowNode[] = [
  ...scheduleTriggerNodes,
  ...messagingTriggerNodes
]
