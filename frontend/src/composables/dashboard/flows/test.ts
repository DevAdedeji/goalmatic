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
            const result = await callFirebaseFunction('testFlow', { flowId: flow.id }) as any
            // result is expected to include success and executionId

            // Refresh the flow runs to show the test run
            await fetchFlowLogs(flow.id)

            // Call the success callback if provided
            if (onSuccess) {
                onSuccess()
            }

            return result
        } catch (error: any) {
            console.error('Error testing flow:', error)
            const errorMessage = error.message || 'Unknown error occurred'
            useAlert().openAlert({
                type: 'ERROR',
                msg: `Error testing flow: ${errorMessage}`
            })
            throw error
        } finally {
            loading.value = false
        }
    }

    return {
        loading,
        testFlow
    }
}
