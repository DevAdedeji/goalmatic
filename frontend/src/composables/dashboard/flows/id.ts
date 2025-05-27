import { ref } from 'vue'
import { useAlert } from '@/composables/core/notification'
import { callFirebaseFunction } from '@/firebase/functions'

export const flowDetails = ref({} as Record<string, any>)
const loading = ref(false)

export const useFetchFlowById = () => {
    const fetchFlowById = async (id: string) => {
        loading.value = true

        try {
            const result = await callFirebaseFunction('getFlowDetails', { id: id as string }) as Record<string, any>
            flowDetails.value = result
            console.log(result, 'result')
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
