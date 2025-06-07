import { ref } from 'vue'
import { defaultGoalmaticAgent } from './fetch'
import { useAlert } from '@/composables/core/notification'
import { callFirebaseFunction } from '@/firebase/functions'


export const agentDetails = ref({} as Record<string, any>)
const loading = ref(false)

export const useFetchAgentsById = () => {
  const fetchAgentsById = async (id: string) => {
  loading.value = true

  if (id === '0') {
    agentDetails.value = defaultGoalmaticAgent
    loading.value = false
    return
  }
  if (!id) return
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
