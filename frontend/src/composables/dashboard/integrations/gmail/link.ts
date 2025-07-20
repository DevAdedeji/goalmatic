import { ref } from 'vue'
import axios from 'axios'
import { v4 as uuidv4 } from 'uuid'
import { Timestamp } from 'firebase/firestore'
import { setFirestoreSubDocument } from '@/firebase/firestore/create'
import { getFirestoreSubCollection } from '@/firebase/firestore/fetch'
import { useAlert } from '@/composables/core/notification'
import { useUser } from '@/composables/auth/user'

const integrationKeys = {
    GMAIL: 'GMAIL'
}

export const useLinkGmail = () => {
    const { id: user_id } = useUser()
    const loading = ref(false)

    const link = async () => {
        loading.value = true

        try {
            console.log('Getting Gmail authorization URL...')
            const { data } = await axios.get('/api/getAuthUrl?integration=gmail')

            if (data.authUrl) {
                console.log('Opening Gmail OAuth window...')
                const authWindow = window.open(data.authUrl, '_blank', 'width=500,height=600,scrollbars=yes,resizable=yes')
                const id = uuidv4()

                if (!authWindow) {
                    throw new Error('Failed to open authentication window. Please check if popups are blocked.')
                }

                const messageHandler = async (event: MessageEvent) => {
                    if (event.origin === window.location.origin) {
                        console.log('OAuth message received:', event.data)

                        try {
                            const oauthResult = JSON.parse(localStorage.getItem('oauth_result') as string)

                            if (oauthResult && oauthResult.success) {
                                const isDefaultGmail = await shouldGmailBeSetAsDefault()

                                console.log('Saving Gmail integration to Firestore...')
                                await setFirestoreSubDocument('users', user_id.value!, 'integrations', id, {
                                    id,
                                    access_token: oauthResult.access_token,
                                    refresh_token: oauthResult.refresh_token,
                                    type: 'EMAIL',
                                    provider: 'GOOGLE',
                                    email: oauthResult.email,
                                    expiry_date: oauthResult.expiry_date,
                                    created_at: Timestamp.fromDate(new Date()),
                                    updated_at: Timestamp.fromDate(new Date()),
                                    is_default: isDefaultGmail,
                                    integration_id: integrationKeys.GMAIL,
                                    user_id: user_id.value!
                                })

                                localStorage.setItem('oauth_result', '')

                                useAlert().openAlert({
                                    type: 'SUCCESS',
                                    msg: 'Gmail connected successfully!'
                                })
                            } else {
                                const errorMsg = oauthResult?.error || 'Gmail authentication failed'
                                console.error('Gmail OAuth failed:', errorMsg)
                                useAlert().openAlert({
                                    type: 'ERROR',
                                    msg: errorMsg
                                })
                            }
                        } catch (parseError) {
                            console.error('Error parsing OAuth result:', parseError)
                            useAlert().openAlert({
                                type: 'ERROR',
                                msg: 'Error processing Gmail authentication'
                            })
                        }

                        loading.value = false
                        window.removeEventListener('message', messageHandler)
                    }
                }

                window.addEventListener('message', messageHandler, { once: true })

                // Handle window close detection
                const windowClosedCheck = setInterval(() => {
                    if (authWindow?.closed) {
                        clearInterval(windowClosedCheck)
                        if (loading.value) {
                            loading.value = false
                            window.removeEventListener('message', messageHandler)
                            useAlert().openAlert({
                                type: 'ERROR',
                                msg: 'Gmail authentication window was closed'
                            })
                        }
                    }
                }, 1000)
            } else {
                throw new Error('Failed to get Gmail authorization URL')
            }
        } catch (error: any) {
            console.error('Gmail integration error:', error)
            loading.value = false

            let errorMessage = 'Failed to initiate Gmail connection'

            if (error.response?.status === 500) {
                errorMessage = 'Server error during Gmail setup. Please try again.'
            } else if (error.message?.includes('popup')) {
                errorMessage = 'Please allow popups for this site to connect Gmail'
            } else if (error.message) {
                errorMessage = error.message
            }

            useAlert().openAlert({
                type: 'ERROR',
                msg: errorMessage
            })
        }
    }

    return { loading, link }
}

const shouldGmailBeSetAsDefault = async () => {
    const { id: user_id } = useUser()
    const fetchedIntegrations = ref([])

    try {
        await getFirestoreSubCollection('users', user_id.value!, 'integrations', fetchedIntegrations)

        // Check if there are any existing Gmail integrations
        const existingGmailIntegrations = fetchedIntegrations.value.filter((integration: any) =>
            integration.type === 'EMAIL' && integration.provider === 'GOOGLE'
        )

        return existingGmailIntegrations.length === 0
    } catch (error) {
        console.error('Error checking existing Gmail integrations:', error)
        return true // Default to true if we can't check
    }
}
