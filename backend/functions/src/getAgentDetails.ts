import { onRequest } from 'firebase-functions/v2/https'
import { goals_db } from './init'

export const getAgentDetails = onRequest(async (req, res) => {
    if (req.method !== 'POST') {
        res.status(400).send('Please send a POST request')
        return
    }
    const { id } = req.body

    if (!id) {
        res.status(400).send('Please provide an agent id')
        return
    }

    try {
        const snapshot = await goals_db.collection('agents').doc(id).get()

        if (!snapshot.exists) {
            res.status(404).send(`This agent doesn't exist`)
            return
        }

        const agentData = snapshot.data()!

        // Get user data for the agent owner
        let userData: Record<string, any> = { name: 'Unknown User' }

        if (agentData.user_id) {
            try {
                const userDoc = await goals_db.collection('users').doc(agentData.user_id).get()
                if (userDoc.exists) {
                    const userDataObj = userDoc.data()!
                    userData = {
                        id: userDataObj.id || agentData.user_id,
                        name: userDataObj.name || 'Unknown User',
                        username: userDataObj.username,
                        photo_url: userDataObj.photo_url,
                    }
                }
            } catch (userError) {
                console.error('Error fetching user data:', userError)
                // Continue with default user data if there's an error
            }
        }

        // Set all toolConfig values to null
        if (agentData.spec && agentData.spec.toolsConfig) {
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


        res.status(200).send({
            ...agentData,
        })

    } catch (error: any) {
        console.error(error);
        res.status(500).send({
            message: 'An error occurred',
            error: error,
            msg: error.message,
        })
    }
})
