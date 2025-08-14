import { ref } from 'vue'
import { useAlert } from '@/composables/core/notification'
import { callFirebaseFunction } from '@/firebase/functions'
import { flowActionNodes, flowTriggerNodes } from '@/composables/dashboard/flows/nodes/list'

export const flowDetails = ref({} as Record<string, any>)
const loading = ref(false)

export const useFetchFlowById = () => {
    const fetchFlowById = async (id: string) => {
        loading.value = true

        try {
            // Provide nodeDefinitions so backend can filter non-owner views by cloneable
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
            allNodes.forEach(n => pushNode(n))

            const result = await callFirebaseFunction('getFlowDetails', { id: id as string, nodeDefinitions: definitions }) as Record<string, any>
            flowDetails.value = result
        } catch (e: any) {
            console.error('Error fetching flow details:', e)
            useAlert().openAlert({
                type: 'ERROR',
                msg: `Error: ${e.message || 'Failed to fetch flow details'}`
            })
        } finally {
            loading.value = false
        }
    }

    return { fetchFlowById, flowDetails, loading }
}
