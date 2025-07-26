import { ref } from 'vue'
import { useAlert } from '@/composables/core/notification'
import { callFirebaseFunction } from '@/firebase/functions'

export const useTestNode = () => {
    const loading = ref(false)
    const testResult = ref<any>(null)

    /**
     * Test a single node with provided data
     * @param nodeId The ID of the node to test (e.g., 'WEB_FETCH_CONTENT_EXA')
     * @param nodeData The node definition data
     * @param propsData The properties/parameters for the node
     */
    const testNode = async (nodeId: string, nodeData: Record<string, any>, propsData: Record<string, any>) => {
        if (!nodeId) {
            useAlert().openAlert({ type: 'ERROR', msg: 'Node ID is missing' })
            return null
        }

        if (!propsData) {
            useAlert().openAlert({ type: 'ERROR', msg: 'Node properties are missing' })
            return null
        }

        loading.value = true
        testResult.value = null

        try {
            // Call the testNode Firebase function
            const result = await callFirebaseFunction('testNode', {
                nodeId,
                nodeData,
                propsData
            }) as any

            testResult.value = result

            if (result.success) {
                useAlert().openAlert({
                    type: 'SUCCESS',
                    msg: `Node test completed successfully in ${result.duration}`
                })
            } else {
                useAlert().openAlert({
                    type: 'ERROR',
                    msg: `Node test failed: ${result.error || 'Unknown error'}`
                })
            }

            return result
        } catch (error: any) {
            console.error('Error testing node:', error)
            const errorMessage = error.message || 'Unknown error occurred'
            useAlert().openAlert({
                type: 'ERROR',
                msg: `Error testing node: ${errorMessage}`
            })
            return null
        } finally {
            loading.value = false
        }
    }

    /**
     * Clear the test result
     */
    const clearTestResult = () => {
        testResult.value = null
    }

    return {
        loading,
        testResult,
        testNode,
        clearTestResult
    }
}
