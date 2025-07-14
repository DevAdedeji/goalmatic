import { ref } from 'vue'
import { useAlert } from '@/composables/core/notification'
import { useUser } from '@/composables/auth/user'
import { callFirebaseFunction } from '@/firebase/functions'

export const useComposioGmail = () => {
    const { id: user_id } = useUser()
    const loading = ref(false)
    const connecting = ref(false)

    const connect = async () => {
        loading.value = true
        connecting.value = true

        try {
            // Initiate Gmail connection
            const result = await callFirebaseFunction('setupComposioGmail', {}) as {
                redirectUrl: string
                connectionId: string
            }
            const { redirectUrl, connectionId } = result

            // Open OAuth window
            const authWindow = window.open(redirectUrl, '_blank', 'width=500,height=600')

            // Check connection status periodically
            const checkConnection = async () => {
                try {
                    const checkResult = await callFirebaseFunction('checkComposioGmailConnection', { connectionId }) as { success: boolean }
                    const { success } = checkResult

                    if (success) {
                        // Connection successful
                        authWindow?.close()
                        connecting.value = false
                        loading.value = false
                        useAlert().openAlert({
                            type: 'SUCCESS',
                            msg: 'Gmail connected successfully via Composio!'
                        })
                        return true
                    } else {
                        // Still connecting, check again
                        setTimeout(checkConnection, 2000)
                    }
                } catch (error) {
                    console.error('Error checking connection:', error)
                    authWindow?.close()
                    connecting.value = false
                    loading.value = false
                    useAlert().openAlert({
                        type: 'ERROR',
                        msg: 'Failed to verify Gmail connection'
                    })
                }
            }

            // Start checking connection status
            setTimeout(checkConnection, 3000)

            // Handle window close
            const windowClosedCheck = setInterval(() => {
                if (authWindow?.closed) {
                    clearInterval(windowClosedCheck)
                    if (connecting.value) {
                        connecting.value = false
                        loading.value = false
                        useAlert().openAlert({
                            type: 'ERROR',
                            msg: 'Gmail connection window was closed'
                        })
                    }
                }
            }, 1000)
        } catch (error) {
            console.error('Error setting up Composio Gmail:', error)
            loading.value = false
            connecting.value = false
            useAlert().openAlert({
                type: 'ERROR',
                msg: 'Failed to initiate Gmail connection'
            })
        }
    }

    const disconnect = async () => {
        // TODO: Implement disconnect functionality
        // This would involve revoking the Composio connection
        useAlert().openAlert({
            type: 'SUCCESS',
            msg: 'Disconnect functionality coming soon'
        })
    }

    return {
        loading,
        connecting,
        connect,
        disconnect
    }
}
