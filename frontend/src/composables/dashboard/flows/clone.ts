import { v4 as uuidv4 } from 'uuid'
import { Timestamp } from 'firebase/firestore'
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { setFirestoreDocument } from '@/firebase/firestore/create'
import { useUser } from '@/composables/auth/user'
import { useAlert } from '@/composables/core/notification'
import { flowActionNodes, flowTriggerNodes } from '@/composables/dashboard/flows/nodes/list'

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

    // Function to perform the actual cloning
    const performClone = async (flowToClone: Record<string, any>) => {
        loading.value = true
        try {
            // Generate a new ID for the cloned flow
            const id = uuidv4()

            // Clone the steps, filtering out non-cloneable properties
            const clonedSteps = (flowToClone.steps || []).map(cloneFlowStep)

            // Clone the trigger if it exists
            const clonedTrigger = flowToClone.trigger ? cloneFlowTrigger(flowToClone.trigger) : null

            // Create the cloned flow data
            const clonedFlow = {
                ...flowToClone,
                id,
                name: `Copy of ${flowToClone.name}`,
                creator_id: user_id.value!,
                created_at: Timestamp.fromDate(new Date()),
                updated_at: Timestamp.fromDate(new Date()),
                status: 0, // Set to draft by default
                steps: clonedSteps,
                trigger: clonedTrigger,
                cloned_from: {
                    id: flowToClone.id,
                    name: flowToClone.name,
                    creator_id: flowToClone.creator_id
                }
            }

            // Save the cloned flow to Firestore
            await setFirestoreDocument('flows', id, clonedFlow)

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
        // Validation is now handled in the component, so just proceed with cloning
        await performClone(flowToClone)
    }

    return { cloneFlow, loading }
}
