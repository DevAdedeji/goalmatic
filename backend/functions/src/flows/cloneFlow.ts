import { onCall, HttpsError } from 'firebase-functions/v2/https'
import { goals_db } from '../init'
import { v4 as uuidv4 } from 'uuid'
import { Timestamp } from 'firebase-admin/firestore'

type NodePropDefinition = { key: string; cloneable?: boolean }
type NodeDefinition = { node_id: string; parent_node_id?: string; props: NodePropDefinition[] }

const buildDefinitionKey = (nodeId?: string, parentNodeId?: string) => `${parentNodeId || ''}::${nodeId || ''}`

const TABLE_PROP_KEYS = new Set(['id', 'tableId', 'selected_table_id'])

const cloneTableBySourceId = async (uid: string, tableId: string): Promise<string> => {
    const tableDoc = await goals_db.collection('tables').doc(tableId).get()
    if (!tableDoc.exists) throw new Error('Table not found')
    const tableData = tableDoc.data()
    if (!tableData) throw new Error('Table data is undefined')
    const newTableId = uuidv4()
    const now = Timestamp.now()
    const { records, ...rest } = tableData as any
    const clonedTableData = {
        ...rest,
        id: newTableId,
        name: `Copy of ${tableData.name}`,
        creator_id: uid,
        created_at: now,
        updated_at: now,
        cloned_from: { id: tableId, name: (tableData as any).name, creator_id: (tableData as any).creator_id }
    }
    await goals_db.collection('tables').doc(newTableId).set(clonedTableData)
    return newTableId
}

const filterNodePropsByCloneable = (node: any, defMap: Record<string, NodePropDefinition[]>, injectedTableId?: string) => {
    if (!node || !node.node_id) return node

    const defKey = buildDefinitionKey(node.node_id, node.parent_node_id)
    const propsDef = defMap[defKey]
    if (!propsDef || !Array.isArray(propsDef)) return node

    const allowedKeys = new Set(propsDef.filter(p => p.cloneable !== false).map(p => p.key))
    const filteredPropsData: Record<string, any> = {}
    const filteredAi: string[] = []

    if (node.propsData) {
        Object.keys(node.propsData).forEach(k => {
            if (allowedKeys.has(k)) {
                filteredPropsData[k] = node.propsData[k]
                if (node.aiEnabledFields && Array.isArray(node.aiEnabledFields) && node.aiEnabledFields.includes(k)) {
                    filteredAi.push(k)
                }
            }
        })
    }

    // Inject cloned tableId into known table props even if they are marked non-cloneable
    if (injectedTableId) {
        for (const prop of propsDef) {
            if (TABLE_PROP_KEYS.has(prop.key)) {
                filteredPropsData[prop.key] = injectedTableId
            }
        }
    }

    return {
        ...node,
        propsData: filteredPropsData,
        ...(filteredAi.length > 0 && { aiEnabledFields: filteredAi })
    }
}

export const cloneFlow = onCall({ cors: true, region: 'us-central1' }, async (request) => {
    try {
        const userId = request.auth?.uid
        if (!userId) throw new HttpsError('unauthenticated', 'You must be logged in to clone a flow')

        const { flowId, nodeDefinitions }: { flowId?: string; nodeDefinitions?: NodeDefinition[] } = request.data || {}
        if (!flowId) throw new HttpsError('invalid-argument', 'flowId is required')

        const snapshot = await goals_db.collection('flows').doc(flowId).get()
        if (!snapshot.exists) throw new HttpsError('not-found', `Flow ${flowId} not found`)

        const flowToClone = snapshot.data() as any

        // Build map of node definitions for cloneable filtering
        const defMap: Record<string, NodePropDefinition[]> = {}
            ; (nodeDefinitions || []).forEach((def) => {
                const key = buildDefinitionKey(def.node_id, def.parent_node_id)
                defMap[key] = def.props || []
            })

        const newId = uuidv4()
        const now = new Date()

        // Auto-clone table if flow specifies a source or we can infer one
        let injectedTableId: string | undefined
        const sourceTableId = (flowToClone as any)?.spec?.sourceTableId as string | undefined
        const agentIdForTableClone = (flowToClone as any)?.spec?.agentIdForTableClone as string | undefined
        const toolsConfigTableId = (flowToClone as any)?.spec?.toolsConfig?.TABLE?.selected_table_id as string | undefined

        // Helper: try to infer a tableId from node props
        const inferTableIdFromNodes = (): string | undefined => {
            const tryGet = (node: any): string | undefined => {
                if (!node || !node.propsData) return undefined
                for (const k of Object.keys(node.propsData)) {
                    if (TABLE_PROP_KEYS.has(k) && typeof node.propsData[k] === 'string' && node.propsData[k]) {
                        return String(node.propsData[k])
                    }
                }
                return undefined
            }
            // Prefer trigger first
            const fromTrigger = tryGet((flowToClone as any).trigger)
            if (fromTrigger) return fromTrigger
            // Scan steps
            const steps: any[] = Array.isArray((flowToClone as any).steps) ? (flowToClone as any).steps : []
            for (const s of steps) {
                const v = tryGet(s)
                if (v) return v
            }
            return undefined
        }

        const candidateSource = sourceTableId || toolsConfigTableId || inferTableIdFromNodes()

        if (candidateSource) {
            injectedTableId = await cloneTableBySourceId(userId, candidateSource)
        } else if (agentIdForTableClone) {
            // Resolve table from agent config
            const agentDoc = await goals_db.collection('agents').doc(agentIdForTableClone).get()
            if (agentDoc.exists) {
                const agentData = agentDoc.data() as any
                const tableId = agentData?.spec?.toolsConfig?.TABLE?.selected_table_id as string | undefined
                if (tableId) {
                    injectedTableId = await cloneTableBySourceId(userId, tableId)
                }
            }
        }

        const clonedSteps = (flowToClone.steps || []).map((step: any) => {
            const filtered = filterNodePropsByCloneable(step, defMap, injectedTableId)
            return { ...filtered, id: uuidv4() }
        })

        const clonedTrigger = flowToClone.trigger ? filterNodePropsByCloneable(flowToClone.trigger, defMap, injectedTableId) : null

        const clonedFlow = {
            ...flowToClone,
            id: newId,
            name: `Copy of ${flowToClone.name}`,
            creator_id: userId,
            created_at: Timestamp.fromDate(now),
            updated_at: Timestamp.fromDate(now),
            status: 0,
            public: false,
            steps: clonedSteps,
            trigger: clonedTrigger,
            // Persist table selection for downstream nodes that rely on toolsConfig
            spec: {
                ...(flowToClone.spec || {}),
                toolsConfig: {
                    ...((flowToClone.spec && (flowToClone.spec as any).toolsConfig) || {}),
                    ...(injectedTableId ? { TABLE: { selected_table_id: injectedTableId } } : {})
                }
            },
            cloned_from: {
                id: flowToClone.id,
                name: flowToClone.name,
                creator_id: flowToClone.creator_id
            }
        }

        await goals_db.collection('flows').doc(newId).set(clonedFlow)

        return { success: true, id: newId }
    } catch (error: any) {
        throw new HttpsError('internal', error?.message || 'Failed to clone flow')
    }
})

