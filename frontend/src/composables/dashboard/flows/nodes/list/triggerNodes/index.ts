import { FlowNode } from '../../types'
import { scheduleTriggerNodes } from './schedule'
import { emailTriggerNodes } from './email'

export const flowTriggerNodes: FlowNode[] = [
  ...scheduleTriggerNodes,
  ...emailTriggerNodes
]
