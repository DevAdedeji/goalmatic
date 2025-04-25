export type FlowNode = {
  id: string
  name: string
  description: string
  type: string
}

export type TriggerNodeType = 'SCHEDULED' | 'MANUAL' | 'EVENT'
