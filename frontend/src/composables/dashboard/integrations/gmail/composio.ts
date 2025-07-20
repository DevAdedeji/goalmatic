import { ref } from 'vue'
import { Timestamp } from 'firebase/firestore'
import { v4 as uuidv4 } from 'uuid'
import { useAlert } from '@/composables/core/notification'
import { callFirebaseFunction } from '@/firebase/functions'
import { setFirestoreSubDocument } from '@/firebase/firestore/create'
import { useUser } from '@/composables/auth/user'

const loading = ref(false)


export const useComposioGmail = () => {
    const { id: user_id } = useUser()
    const connect = async () => {
        loading.value = true
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
                    const checkResult = await callFirebaseFunction('checkComposioGmailConnection', { connectionId }) as { success: boolean, data: any }
                    const { success } = checkResult

                    console.log('checkResult', checkResult.data)

                    if (success) {
                        const id = uuidv4()
                        // Connection successful
                        authWindow?.close()

                        loading.value = false

                        await setFirestoreSubDocument('users', user_id.value!, 'integrations', id, {
                                id,
                                access_token: checkResult.data.access_token,
                                refresh_token: checkResult.data.refresh_token,
                                type: 'EMAIL',
                                provider: 'GOOGLE_COMPOSIO',
                                expiry_date: checkResult.data.expires_in,
                                created_at: Timestamp.fromDate(new Date()),
                                updated_at: Timestamp.fromDate(new Date()),
                                integration_id: 'GMAIL',
                                user_id: user_id.value!
                            })
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
                    if (loading.value) {
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
            useAlert().openAlert({
                type: 'ERROR',
                msg: 'Failed to initiate Gmail connection'
            })
        }
    }


    return {
        loading,
        connect
    }
}
