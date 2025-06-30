import { onCall, HttpsError } from 'firebase-functions/v2/https'
import { goals_db } from '../init'
import { defaultGoalmaticAgent } from '../whatsapp/utils/WhatsappAgent'



export const getAgentDetails = onCall({
    cors: true,
    region: 'us-central1',
}, async (request) => {
    const { id } = request.data

    if (!id) {
        throw new HttpsError('invalid-argument', 'Please provide an agent id')
    }

    // Return default agent if id is 0
    if (id === '0' || id === 0) {
        return defaultGoalmaticAgent
    }

    try {
        const snapshot = await goals_db.collection('agents').doc(id).get()

        if (!snapshot.exists) {
            throw new HttpsError('not-found', `This agent doesn't exist`)
        }

        const agentData = snapshot.data()!

        // Set all toolConfig values to null only if the requester is not the creator
        if (agentData.spec && agentData.spec.toolsConfig && request.auth && request.auth.uid !== agentData.creator_id) {
            const toolsConfig = { ...agentData.spec.toolsConfig }

            // Iterate through all tools and set their config values to null
            Object.keys(toolsConfig).forEach(toolKey => {
                if (toolsConfig[toolKey] && typeof toolsConfig[toolKey] === 'object') {
                    Object.keys(toolsConfig[toolKey]).forEach(configKey => {
                        // Set each config value to null
                        toolsConfig[toolKey][configKey] = null
                    })
                }
            })

            // Update the agent data with nullified toolsConfig
            agentData.spec.toolsConfig = toolsConfig
        }
        return {
            ...agentData,
            created_at: new Date(agentData.created_at._seconds * 1000).toISOString(),
            updated_at: new Date(agentData.updated_at._seconds * 1000).toISOString()
        }

    } catch (error: any) {
        throw new HttpsError('internal', `${error.message || 'An error occurred'}`)
    }
})


