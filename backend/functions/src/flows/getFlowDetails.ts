import { onCall, HttpsError } from 'firebase-functions/v2/https'
import { goals_db } from '../init'

type NodePropDefinition = { key: string; cloneable?: boolean }
type NodeDefinition = { node_id: string; parent_node_id?: string; props: NodePropDefinition[] }

const buildDefinitionKey = (nodeId?: string, parentNodeId?: string) => `${parentNodeId || ''}::${nodeId || ''}`

function filterByCloneable(
    node: any,
    defMap: Record<string, NodePropDefinition[]>
): any {
    if (!node || !node.propsData) return node
    const key = buildDefinitionKey(node.node_id, node.parent_node_id)
    const propsDef = defMap[key]
    if (!propsDef || !Array.isArray(propsDef)) {
        // If no definition is provided, hide all props for safety
        return { ...node, propsData: {}, ...(node.aiEnabledFields ? { aiEnabledFields: [] } : {}) }
    }

    const allowed = new Set(propsDef.filter(p => p.cloneable !== false).map(p => p.key))
    const sanitizedProps: Record<string, any> = {}
    const sanitizedAi: string[] = []
    Object.keys(node.propsData).forEach(k => {
        if (allowed.has(k)) {
            sanitizedProps[k] = node.propsData[k]
            if (node.aiEnabledFields && Array.isArray(node.aiEnabledFields) && node.aiEnabledFields.includes(k)) {
                sanitizedAi.push(k)
            }
        }
    })
    return {
        ...node,
        propsData: sanitizedProps,
        ...(sanitizedAi.length > 0 ? { aiEnabledFields: sanitizedAi } : {})
    }
}

export const getFlowDetails = onCall({
    cors: true,
    region: 'us-central1',
}, async (request) => {
    const { id } = request.data

    if (!id) {
        throw new HttpsError('invalid-argument', 'Please provide a flow id')
    }

    try {
        const snapshot = await goals_db.collection('flows').doc(id).get()

        if (!snapshot.exists) {
            throw new HttpsError('not-found', `This flow doesn't exist`)
        }

        const flowData = snapshot.data()!


        const isPublic = flowData.public === true
        const isCreator = request.auth && request.auth.uid === flowData.creator_id

        if (!isPublic && !isCreator) {
            throw new HttpsError('permission-denied', 'You do not have permission to view this flow')
        }

        // For public viewers (non-creators), filter propsData using cloneable flags from nodeDefinitions
        if (!isCreator) {
            const { nodeDefinitions = [] }: { nodeDefinitions?: NodeDefinition[] } = request.data || {}
            const defMap: Record<string, NodePropDefinition[]> = {}
            nodeDefinitions.forEach(def => {
                const k = buildDefinitionKey(def.node_id, def.parent_node_id)
                defMap[k] = def.props || []
            })

            if (flowData.steps) {
                flowData.steps = flowData.steps.map((step: any) => filterByCloneable(step, defMap))
            }

            if (flowData.trigger) {
                flowData.trigger = filterByCloneable(flowData.trigger, defMap)
            }
        }
        return {
            ...flowData,
            created_at: convertTimestamp(flowData.created_at)
        }

    } catch (error: any) {
        throw new HttpsError('internal', `${error.message || 'An error occurred'}`)
    }
})


// Removed nonCloneables-based filtering. Backend no longer redacts propsData using nonCloneables.

/**
 * Helper function to convert Firestore timestamp to ISO string
 */
function convertTimestamp(timestamp: any): string | null {
    if (!timestamp) {
        return null;
    }

    // Handle Firestore Timestamp with _seconds property
    if (timestamp._seconds) {
        return new Date(timestamp._seconds * 1000).toISOString();
    }

    // Handle Firestore Timestamp with toDate method
    if (timestamp.toDate && typeof timestamp.toDate === 'function') {
        return timestamp.toDate().toISOString();
    }

    // Handle regular Date object
    if (timestamp instanceof Date) {
        return timestamp.toISOString();
    }

    // Handle string that might already be an ISO string
    if (typeof timestamp === 'string') {
        try {
            const date = new Date(timestamp);
            if (!isNaN(date.getTime())) {
                return date.toISOString();
            }
        } catch (e) {
            // Invalid date string
        }
    }

    // Return as is if we can't convert
    return timestamp;
}




