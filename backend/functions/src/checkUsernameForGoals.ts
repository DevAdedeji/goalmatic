
import { onCall } from 'firebase-functions/v2/https'
import { goals_db } from './init'




export const checkUsernameForGoals = onCall({cors: true, region: 'us-central1'},async (request) => {
    const { username } = request.data
    const user = await goals_db.collection('users').where('username', '==', username).get()
    const exists = !user.empty
    return { exists }
})
