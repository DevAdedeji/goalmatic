import { v4 as uuidv4 } from 'uuid'
import { Timestamp } from 'firebase/firestore'
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { setFirestoreDocument } from '@/firebase/firestore/create'
import { useUser } from '@/composables/auth/user'
import { useAlert } from '@/composables/core/notification'
import { flowActionNodes, flowTriggerNodes } from '@/composables/dashboard/flows/nodes/list'
import { agentToolConfigs } from '@/composables/dashboard/assistant/agents/tools/config'
import { callFirebaseFunction } from '@/firebase/functions'
import { useFetchIntegrations } from '@/composables/dashboard/integrations/fetch'
import { checkFlowRequirements } from '@/composables/dashboard/flows/approval'
import { useFlowsModal } from '@/composables/core/modals'

export const useCloneFlow = () => {
    const { id: user_id, userProfile, isLoggedIn } = useUser()
    const loading = ref(false)
    const router = useRouter()

    /**
     * Find node definition from the available nodes
     */
    const findNodeDefinition = (nodeId: string, parentNodeId?: string): Record<string, any> | null => {
        const allNodes = [...flowActionNodes, ...flowTriggerNodes]

        // First, try to find a direct match
        let nodeDefinition = allNodes.find((node) => node.node_id === nodeId)

        // If not found and we have a parent node ID, look in children
        if (!nodeDefinition && parentNodeId) {
            const parentNode = allNodes.find((node) => node.node_id === parentNodeId)
            if (parentNode?.children) {
                nodeDefinition = parentNode.children.find((child) => child.node_id === nodeId)
            }
        }

        return nodeDefinition || null
    }

    /**
     * Filters out properties that should not be cloned based on the cloneable flag
     */
    const filterCloneableProperties = (node: Record<string, any>): Record<string, any> => {
        if (!node.propsData) return node

        const nodeDefinition = findNodeDefinition(node.node_id, node.parent_node_id)
        if (!nodeDefinition?.props) return node

        const filteredPropsData: Record<string, any> = {}
        const filteredAiEnabledFields: string[] = []

        for (const prop of nodeDefinition.props) {
            const propKey = prop.key
            const shouldClone = prop.cloneable !== false // Default to true if not specified

            if (shouldClone && node.propsData.hasOwnProperty(propKey)) {
                filteredPropsData[propKey] = node.propsData[propKey]

                // Also preserve AI-enabled fields for cloneable properties
                if (node.aiEnabledFields && node.aiEnabledFields.includes(propKey)) {
                    filteredAiEnabledFields.push(propKey)
                }
            }
        }

        return {
            ...node,
            propsData: filteredPropsData,
            ...(filteredAiEnabledFields.length > 0 && { aiEnabledFields: filteredAiEnabledFields })
        }
    }

    /**
     * Clones a workflow step, filtering out non-cloneable properties
     */
    const cloneFlowStep = (step: Record<string, any>): Record<string, any> => {
        // Generate new ID for the cloned step
        const baseClonedStep = {
            ...step,
            id: uuidv4()
        }

        // Filter out non-cloneable properties
        return filterCloneableProperties(baseClonedStep)
    }

    /**
     * Clones a workflow trigger, filtering out non-cloneable properties
     */
    const cloneFlowTrigger = (trigger: Record<string, any>): Record<string, any> => {
        // Filter out non-cloneable properties
        return filterCloneableProperties(trigger)
    }

    // Ensure any required tables are cloned automatically, and minimal config is set
    const prepareEnvironmentForFlow = async (flowToClone: Record<string, any>) => {
        const { fetchedIntegrations, fetchUserIntegrations } = useFetchIntegrations()
        await fetchUserIntegrations()
        const userIntegrations = fetchedIntegrations.value || []

        const { requirements } = checkFlowRequirements(flowToClone, userIntegrations)

        // If any config requirements are table-related and source table is provided, clone it
        for (const cfg of requirements.config) {
            const props = cfg.props || []
            const propKeys = props.map((p: any) => p.key)
            const needsTable = propKeys.some((k: string) => ['id', 'tableId', 'selected_table_id'].includes(k))

            if (needsTable) {
                const sourceTableId = (flowToClone as any)?.spec?.sourceTableId
                const agentIdForTableClone = (flowToClone as any)?.spec?.agentIdForTableClone
                try {
                    if (sourceTableId) {
                        const result = await callFirebaseFunction('cloneTableById', { tableId: sourceTableId }) as any
                        const newTableId = result?.tableId
                        if (newTableId) {
                            agentToolConfigs.value.TABLE = agentToolConfigs.value.TABLE || {}
                            agentToolConfigs.value.TABLE.selected_table_id = newTableId
                        }
                    } else if (agentIdForTableClone) {
                        const result = await callFirebaseFunction('cloneTable', { agentId: agentIdForTableClone }) as any
                        const newTableId = result?.tableId
                        if (newTableId) {
                            agentToolConfigs.value.TABLE = agentToolConfigs.value.TABLE || {}
                            agentToolConfigs.value.TABLE.selected_table_id = newTableId
                        }
                    }
                } catch (_e) {
                    // Silently continue; user can configure later if cloning fails
                }
            }
        }
    }

    // Function to perform the actual cloning
    const performClone = async (flowToClone: Record<string, any>) => {
        loading.value = true
        try {
            // Pre-clone requirements are handled via approval modal; no auto environment prep here
            // Build minimal node definitions for backend clone filtering
            const allNodes = [...flowActionNodes, ...flowTriggerNodes]
            const definitions: Array<{ node_id: string; parent_node_id?: string; props: Array<{ key: string; cloneable?: boolean }> }> = []
            const pushNode = (n: any, parent?: any) => {
                if (n && n.props) {
                    definitions.push({
                        node_id: n.node_id,
                        parent_node_id: parent?.node_id,
                        props: n.props.map((p: any) => ({ key: p.key, cloneable: p.cloneable }))
                    })
                }
                if (n && Array.isArray(n.children)) n.children.forEach((c: any) => pushNode(c, n))
            }
            allNodes.forEach((n) => pushNode(n))

            // Ask backend to clone with server-side cloneable filtering
            const res = await callFirebaseFunction('cloneFlow', {
                flowId: flowToClone.id,
                nodeDefinitions: definitions
            }) as any
            const id = res?.id
            if (!id) throw new Error('Failed to create cloned flow')

            // Show success message
            useAlert().openAlert({
                type: 'SUCCESS',
                msg: 'Workflow cloned successfully'
            })

            // Navigate to the new flow's page
            router.push(`/flows/${id}`)
            return true
        } catch (error: any) {
            useAlert().openAlert({
                type: 'ERROR',
                msg: `Error cloning workflow: ${error.message}`
            })
            return false
        } finally {
            loading.value = false
        }
    }

    const cloneFlow = async (flowToClone: Record<string, any>) => {
        // 1) Clone first (server-side)
        const ok = await performClone(flowToClone)
        if (!ok) return false

        // 2) Fetch cloned flow and show requirements modal for configuring the cloned copy
        const { fetchedIntegrations, fetchUserIntegrations } = useFetchIntegrations()
        await fetchUserIntegrations()
        const userIntegrations = fetchedIntegrations.value || []

        // We just navigated to the cloned flow route; wait a tick then open modal for the cloned copy
        setTimeout(async () => {
            // The router push in performClone navigates to the cloned flow page, where `flowDetails` will load
            // For UX: compute requirements using the source definition; config will be applied on the cloned flow via editor
            console.log(flowToClone, 'flowToClone')
            console.log(userIntegrations, 'userIntegrations')
            const { requirements } = checkFlowRequirements(flowToClone, userIntegrations)
            console.log(requirements, 'requirements')
            useFlowsModal().openCloneFlowApprovalModal({
                requirements,
                userIntegrations
            })
        }, 250)
        return true
    }

    return { cloneFlow, loading }
}
