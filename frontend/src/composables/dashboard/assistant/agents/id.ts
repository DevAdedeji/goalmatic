import { ref } from 'vue'
import { defaultGoalmaticAgent } from './fetch'
import { getSingleFirestoreDocument } from '@/firebase/firestore/fetch'
import { useAlert } from '@/composables/core/notification'
import { callFirebaseFunction } from '@/firebase/functions'
import { useAgentOwner } from '@/composables/dashboard/assistant/agents/owner'

const agentDetails = ref({} as Record<string, any>)
const loading = ref(false)

export const useFetchAgentsById = () => {
    // const fetchAgentsById = async (id: string) => {
    //     loading.value = true
    //     agentDetails.value = {} // Reset agent details

    //     try {
    //         await getSingleFirestoreDocument('agents', id, agentDetails)
    //         return agentDetails.value
    //     } catch (e: any) {
    //         console.error('Error fetching agent by ID:', e)

    //         // Handle different error cases
    //         if (e.code === 'permission-denied') {
    //             useAlert().openAlert({
    //                 type: 'ERROR',
    //                 msg: 'You don\'t have permission to access this agent. It may be private'
    //             })
    //         } else if (e.code === 'not-found') {
    //             useAlert().openAlert({
    //                 type: 'ERROR',
    //                 msg: 'Agent not found'
    //             })
    //         } else {
    //             useAlert().openAlert({
    //                 type: 'ERROR',
    //                 msg: `Error: ${e.message}`
    //             })
    //         }

    //         return null
    //     } finally {
    //         loading.value = false
    //     }
    // }

    const fetchAgentsById = async (id: string) => {
  loading.value = true

  if (id === '0') {
    agentDetails.value = defaultGoalmaticAgent
    loading.value = false
    return
  }

  try {
    const result = await callFirebaseFunction('getAgentDetails', { id: id as string }) as Record<string, any>
	  agentDetails.value = result
  } catch (e: any) {
    console.error('Error fetching agent details:', e)
    useAlert().openAlert({
      type: 'ERROR',
      msg: `Error: ${e.message || 'Failed to fetch agent details'}`
    })
  } finally {
    loading.value = false
  }
}


    return { fetchAgentsById, agentDetails, loading, defaultGoalmaticAgent }
}
