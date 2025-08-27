import { onCall, HttpsError } from 'firebase-functions/v2/https'
import { goals_db } from '../init'
import { v4 as uuidv4 } from 'uuid'
import { Timestamp } from 'firebase-admin/firestore'

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

export const ownerCloneFlow = onCall({ cors: true, region: 'us-central1' }, async (request) => {
    try {
        const userId = request.auth?.uid
        if (!userId) throw new HttpsError('unauthenticated', 'You must be logged in to clone a flow')

        const { flowId }: { flowId?: string } = request.data || {}
        if (!flowId) throw new HttpsError('invalid-argument', 'flowId is required')

        const snapshot = await goals_db.collection('flows').doc(flowId).get()
        if (!snapshot.exists) throw new HttpsError('not-found', `Flow ${flowId} not found`)

        const flowToClone = snapshot.data() as any

        // Check if user is the owner
        if (flowToClone.creator_id !== userId) {
            throw new HttpsError('permission-denied', 'You can only clone your own flows')
        }

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

        // Clone all steps with ALL their properties (no filtering for owner clone)
        const clonedSteps = (flowToClone.steps || []).map((step: any) => {
            return { ...step, id: uuidv4() }
        })

        // Clone trigger but clean up sensitive properties like email addresses and scheduled dates
        const clonedTrigger = flowToClone.trigger ? (() => {
            const trigger = { ...flowToClone.trigger }

            // Clean up email trigger specific properties
            if (trigger.node_id === 'EMAIL_TRIGGER' && trigger.propsData) {
                // Reset email but keep the structure so frontend can handle it
                trigger.propsData = {
                    ...trigger.propsData,
                    email: null // Reset to null so frontend knows to generate new one
                }
            }


            return trigger
        })() : null

        // For owner clone, preserve all original properties including sensitive ones
        const clonedFlow = {
            ...flowToClone,
            id: newId,
            name: `Copy of ${flowToClone.name}`,
            creator_id: userId,
            created_at: Timestamp.fromDate(now),
            updated_at: Timestamp.fromDate(now),
            status: 0, // Always start as inactive
            public: false, // Always start as private
            steps: clonedSteps,
            trigger: clonedTrigger,
            // Update table selection if we cloned a table
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