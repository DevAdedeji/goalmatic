export type FlowNodeProp = {
  name: string
  key: string
  type: string
  required?: boolean
  description?: string
  validate?: any
  value?: any
  options?: any[]
  disabled?: boolean
  ai_enabled?: boolean
}

export type FlowNode = {
  id?: string
  node_id?: string
  name: string
  description: string
  type: string
  icon?: string
  provider?: string
  category?: string
  children?: FlowNode[]
  props?: FlowNodeProp[]
}

export type TriggerNodeType = 'SCHEDULED' | 'MANUAL' | 'EVENT'
