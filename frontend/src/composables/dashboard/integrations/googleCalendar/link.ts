
import axios from 'axios'
import { v4 as uuidv4 } from 'uuid'
import { Timestamp } from 'firebase/firestore'
import { setFirestoreSubDocument } from '@/firebase/firestore/create'
import { useAlert } from '@/composables/core/notification'
import { useUser } from '@/composables/auth/user'


const integrationKeys = {
    GOOGLECALENDAR: 'GOOGLECALENDAR'

}

const loading = ref(false)

export const useLinkGoogleCalendar = () => {
    const { id: user_id } = useUser()


    const link = async () => {
        loading.value = true

        let oauthCompleted = false
        let popupCheckInterval: number | undefined

        try {
            const { data } = await axios.get('/api/getAuthUrl?integration=calendar')
            if (data.authUrl) {
                const authWindow = window.open(data.authUrl, '_blank')
                const id = uuidv4()

                // Start polling to check if the window is closed
                popupCheckInterval = window.setInterval(() => {
                    if (authWindow && authWindow.closed && !oauthCompleted) {
                        loading.value = false
                        useAlert().openAlert({ type: 'ERROR', msg: 'Google Calendar connection was not completed.' })
                        window.clearInterval(popupCheckInterval)
                    }
                }, 1000)

                window.addEventListener('message', async (event) => {
                    if (event.origin === window.location.origin) {
                        const oauthResult = JSON.parse(localStorage.getItem('oauth_result') as string)
                        if (oauthResult && oauthResult.success) {
                            oauthCompleted = true
                            if (popupCheckInterval) window.clearInterval(popupCheckInterval)
                            const isDefaultCalendar = true
                            setFirestoreSubDocument('users', user_id.value!, 'integrations', id, {
                                id,
                                access_token: oauthResult.access_token,
                                refresh_token: oauthResult.refresh_token,
                                type: 'CALENDAR',
                                provider: 'GOOGLE_COMPOSIO',
                                email: oauthResult.email,
                                expiry_date: oauthResult.expiry_date,
                                created_at: Timestamp.fromDate(new Date()),
                                updated_at: Timestamp.fromDate(new Date()),
                                is_default: isDefaultCalendar,
                                integration_id: integrationKeys.GOOGLECALENDAR,
                                user_id: user_id.value!
                            })
                            localStorage.setItem('oauth_result', '')
                        } else {
                            // useAlert().openAlert({ type: 'ERROR', msg: 'Error during token exchange' })
                        }
                        loading.value = false
                        if (popupCheckInterval) window.clearInterval(popupCheckInterval)
                    }
                }, { once: true })
            } else {
                throw new Error('Authorization URL not received')
            }
        } catch (error) {
            useAlert().openAlert({ type: 'ERROR', msg: 'Error getting authorization URL' })
            loading.value = false
            if (popupCheckInterval) window.clearInterval(popupCheckInterval)
        }
    }

    return { loading, link }
}

