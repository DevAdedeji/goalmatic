export type FlowNodeProp = {
  name: string
  key: string
  type: string
  required: boolean
  description?: string
  validate?: any
  value?: any
  options?: any[]
  disabled?: boolean
  disabledFunc?: (formValues: Record<string, any>) => boolean
  hidden?: boolean
  hiddenFunc?: (formValues: Record<string, any>) => boolean
  ai_enabled?: boolean
  cloneable?: boolean
  // Properties for searchableSelect type
  loading?: boolean
  loadOptions?: (query: string) => Promise<any[]>
  loadingText?: string
  searchPlaceholder?: string
  minSearchLength?: number
  // Additional properties for UI components
  placeholder?: string
  copyable?: boolean
  auto_generate?: boolean
}

export type FlowNodeOutputProp = {
  name: string
  key: string
  type: string
  description?: string
}

export type IntegrationRequirement = {
  type: string // e.g., 'EMAIL'
  provider: string // e.g., 'GOOGLE_COMPOSIO'
  label?: string // Friendly display label
}

export type FlowNode = {
  id?: string
  node_id?: string
  name: string
  description: string
  type: string
  icon: string
  provider?: string
  category?: string
  isTestable?: boolean
  children?: FlowNode[]
  props?: FlowNodeProp[]
  outputProps?: FlowNodeOutputProp[]
  expectedOutput?: FlowNodeOutputProp[]
  // Optional integration requirement to gate node usage (e.g., Gmail via Composio)
  requiresIntegration?: IntegrationRequirement
}

export type TriggerNodeType = 'SCHEDULED' | 'MANUAL' | 'EVENT'
