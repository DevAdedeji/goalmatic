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
            const { data } = await axios.get('/api/getAuthUrl?integration=gmail')
            if (data.authUrl) {
                const authWindow = window.open(data.authUrl, '_blank')
                const id = uuidv4()

                window.addEventListener('message', async (event) => {
                    if (event.origin === window.location.origin) {
                        const oauthResult = JSON.parse(localStorage.getItem('oauth_result') as string)
                        if (oauthResult && oauthResult.success) {
                            const isDefaultGmail = await shouldGmailBeSetAsDefault()
                            setFirestoreSubDocument('users', user_id.value!, 'integrations', id, {
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
                            useAlert().openAlert({ type: 'SUCCESS', msg: 'Gmail connected successfully' })
                        } else {
                            useAlert().openAlert({ type: 'ERROR', msg: 'Error during Gmail OAuth authentication' })
                        }
                        loading.value = false
                    }
                }, { once: true })
            } else {
                throw new Error('Authorization URL not received')
            }
        } catch (error) {
            useAlert().openAlert({ type: 'ERROR', msg: 'Error getting Gmail authorization URL' })
            loading.value = false
        }
    }

    return { loading, link }
}

const shouldGmailBeSetAsDefault = async () => {
    const { id: user_id } = useUser()
    const fetchedIntegrations = ref([])
    await getFirestoreSubCollection('users', user_id.value!, 'integrations', fetchedIntegrations)
    return fetchedIntegrations.value.length === 0
}
