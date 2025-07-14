import { ref } from 'vue'
import { useFlowLogs } from './logs'
import { useAlert } from '@/composables/core/notification'
import { callFirebaseFunction } from '@/firebase/functions'

export const useTestFlow = () => {
    const loading = ref(false)
    const { fetchFlowLogs } = useFlowLogs()

    /**
     * Test a flow without activating it
     * @param flow The flow to test
     * @param onSuccess Optional callback to run after successful test
     */
    const testFlow = async (flow: Record<string, any>, onSuccess?: () => void) => {
        if (!flow.id) {
            useAlert().openAlert({ type: 'ERROR', msg: 'Flow ID is missing' })
            return
        }

        loading.value = true

        try {
            // Call the testFlow Firebase function
            await callFirebaseFunction('testFlow', { flowId: flow.id }) as any
            useAlert().openAlert({ type: 'SUCCESS', msg: 'Flow test completed successfully' })

            // Refresh the flow runs to show the test run
            await fetchFlowLogs(flow.id)

            // Call the success callback if provided
            if (onSuccess) {
                onSuccess()
            }
        } catch (error: any) {
            console.error('Error testing flow:', error)
            const errorMessage = error.message || 'Unknown error occurred'
            useAlert().openAlert({
                type: 'ERROR',
                msg: `Error testing flow: ${errorMessage}`
            })
        } finally {
            loading.value = false
        }
    }

    return {
        loading,
        testFlow
    }
}
