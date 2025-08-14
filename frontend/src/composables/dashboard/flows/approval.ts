import { flowActionNodes, flowTriggerNodes } from './nodes/list'
import type { FlowNode, FlowNodeProp } from './nodes/types'
import { getMissingRequiredProps } from './nodes/nodeOperations'
import { availableTools } from '@/composables/dashboard/assistant/agents/tools/list'

type IntegrationRequirement = {
    id: string
    name: string
    icon: string
}

type ConfigRequirement = {
    nodeRef: { type: 'trigger' } | { type: 'step'; index: number }
    nodeName: string
    props: FlowNodeProp[]
}

export type FlowRequirements = {
    integrations: IntegrationRequirement[]
    config: ConfigRequirement[]
}

const findNodeDefinition = (nodeId?: string, parentNodeId?: string, isTrigger?: boolean): FlowNode | null => {
    if (!nodeId) return null
    const allParents = isTrigger ? flowTriggerNodes : flowActionNodes
    // direct match
    let nodeDef = allParents.find((n) => n.node_id === nodeId) || null
    if (nodeDef) return nodeDef
    if (parentNodeId) {
        const parent = allParents.find((n) => n.node_id === parentNodeId)
        if (parent?.children) {
            const child = parent.children.find((c) => c.node_id === nodeId)
            if (child) return child as unknown as FlowNode
        }
    }
    // search all children for safety
    for (const parent of allParents) {
        if (parent.children) {
            const child = parent.children.find((c) => c.node_id === nodeId)
            if (child) return child as unknown as FlowNode
        }
    }
    return null
}

const simulatePostClonePropsData = (
    node: Record<string, any>,
    isTrigger: boolean
): Record<string, any> => {
    const def = findNodeDefinition(node.node_id, node.parent_node_id, isTrigger)
    if (!def || !Array.isArray((def as any).props)) return node.propsData || {}
    const propsData: Record<string, any> = { ...(node.propsData || {}) }
    // Remove non-cloneable props (cloneable === false)
    for (const prop of (def as any).props as FlowNodeProp[]) {
        const shouldClone = prop.cloneable !== false
        if (!shouldClone && prop.key in propsData) {
            delete propsData[prop.key]
        }
    }
    // Server auto-injects table selection; treat table-related props as satisfied
    const TABLE_KEYS = new Set(['id', 'tableId', 'selected_table_id'])
        ; (def as any).props.forEach((prop: FlowNodeProp) => {
            if (TABLE_KEYS.has(prop.key)) {
                propsData[prop.key] = propsData[prop.key] || '__AUTO_TABLE__'
            }
        })
    return propsData
}

const inferIntegrationIdsFromNode = (node: Record<string, any>): string[] => {
    const ids: string[] = []
    const base = (node.parent_node_id || node.node_id || '') as string
    const child = (node.node_id || '') as string
    const match = (s: string, token: string) => s.includes(token)
    if (match(base, 'GMAIL') || match(child, 'GMAIL')) ids.push('GMAIL')
    if (match(base, 'GOOGLECALENDAR') || match(child, 'GOOGLECALENDAR')) ids.push('GOOGLECALENDAR')
    if (match(base, 'SEND_WHATSAPP_MESSAGE') || match(child, 'SEND_WHATSAPP_MESSAGE')) ids.push('WHATSAPP')
    return ids
}

export const checkFlowRequirements = (
    flow: Record<string, any>,
    userIntegrations: Record<string, any>[] = []
): { requirements: FlowRequirements; missingIntegrationIds: string[]; hasRequirements: boolean } => {
    const integrationIds = new Set<string>()
    const configReqs: ConfigRequirement[] = []

    // Trigger
    if (flow.trigger) {
        inferIntegrationIdsFromNode(flow.trigger).forEach((id) => integrationIds.add(id))

        const simulated = simulatePostClonePropsData(flow.trigger, true)
        const simulatedNode = { ...flow.trigger, propsData: simulated }
        // Filter out table-related props from missing list (handled automatically)
        const allMissing = getMissingRequiredProps(simulatedNode)
        const filteredMissing = allMissing.filter((p: any) => !['id', 'tableId', 'selected_table_id'].includes(p.key))
        if (filteredMissing.length > 0) {
            configReqs.push({ nodeRef: { type: 'trigger' }, nodeName: flow.trigger.name || 'Trigger', props: filteredMissing })
        }
    }

    // Steps
    const steps: any[] = Array.isArray(flow.steps) ? flow.steps : []
    steps.forEach((step, index) => {
        inferIntegrationIdsFromNode(step).forEach((id) => integrationIds.add(id))
        const simulated = simulatePostClonePropsData(step, false)
        const simulatedNode = { ...step, propsData: simulated }
        const allMissing = getMissingRequiredProps(simulatedNode)
        const filteredMissing = allMissing.filter((p: any) => !['id', 'tableId', 'selected_table_id'].includes(p.key))
        if (filteredMissing.length > 0) {
            configReqs.push({ nodeRef: { type: 'step', index }, nodeName: step.name || `Step ${index + 1}`, props: filteredMissing })
        }
    })

    // Map integration ids to tool meta
    const allTools = availableTools.value || []
    const integrations: IntegrationRequirement[] = Array.from(integrationIds)
        .map((id) => {
            const tool = allTools.find((t: any) => t.id === id)
            return tool ? { id, name: tool.name, icon: tool.icon } : { id, name: id, icon: '/bot.png' }
        })
        // Only those that actually require integration (checkStatus === true)
        .filter((req) => {
            const tool = allTools.find((t: any) => t.id === req.id)
            return tool?.checkStatus === true
        })

    const missingIntegrationIds = integrations
        .filter((req) => !userIntegrations.some((ui: any) => ui.integration_id === req.id))
        .map((r) => r.id)

    const requirements: FlowRequirements = {
        integrations,
        config: configReqs
    }

    const hasRequirements = requirements.config.length > 0 || missingIntegrationIds.length > 0

    return { requirements, missingIntegrationIds, hasRequirements }
}

