import { Timestamp } from 'firebase/firestore'
import { useFlowRuns } from './runs'
import { useEditFlow } from './edit'
import { useAlert } from '@/composables/core/notification'
import { callFirebaseFunction } from '@/firebase/functions'

export const useToggleFlow = () => {
    const loading = ref(false)
    const { fetchFlowRuns } = useFlowRuns()
    const { updateFlow } = useEditFlow() // Get updateFlow from useEditFlow

    const toggleFlowStatus = async (flow: Record<string, any>) => {
        const newStatus = flow.status === 1 ? 0 : 1 // 1: active, 0: draft

        loading.value = true

        try {
                if (!flow.id) {
                    throw new Error('Flow ID is missing')
                }
            if (newStatus === 1) {
                await callFirebaseFunction('activateFlow', { flowId: flow.id }) as any
                useAlert().openAlert({ type: 'SUCCESS', msg: 'Flow scheduled successfully' })
            } else {
                await callFirebaseFunction('deactivateFlow', { flowId: flow.id }) as any
                useAlert().openAlert({ type: 'SUCCESS', msg: 'Flow paused successfully' })
            }
        } catch (error: any) {
            console.error('Error toggling flow status:', error)
            const errorMessage = error.message || 'Unknown error occurred'
            useAlert().openAlert({
                type: 'ERROR',
                msg: `${errorMessage}`
            })
        } finally {
            loading.value = false
        }
    }

    return {
        loading,
        toggleFlowStatus
    }
}
