import { v4 as uuidv4 } from 'uuid'
import { Timestamp } from 'firebase/firestore'
import { setFirestoreDocument } from '@/firebase/firestore/create'
import { useUser } from '@/composables/auth/user'
import { useAlert } from '@/composables/core/notification'

export const useCloneAgent = () => {
    const { id: user_id, userProfile, isLoggedIn } = useUser()
    const loading = ref(false)
    const router = useRouter()

    /**
     * Check if the current user can clone the agent
     * Rules:
     * 1. User must be logged in
     * 2. User cannot clone their own agent
     */
    const canCloneAgent = (agent: Record<string, any>): boolean => {
        // Check if user is logged in
        if (!isLoggedIn.value || !user_id.value) {
            return false
        }

        // Check if the agent belongs to the current user
        if (agent.user_id === user_id.value) {
            return false
        }

        return true
    }

    const cloneAgent = async (agentToClone: Record<string, any>) => {
        // Check if user can clone this agent
        if (!canCloneAgent(agentToClone)) {
            if (!isLoggedIn.value) {
                useAlert().openAlert({
                    type: 'ERROR',
                    msg: 'You must be logged in to clone an agent'
                })
                return
            }

            if (agentToClone.user_id === user_id.value) {
                useAlert().openAlert({
                    type: 'ERROR',
                    msg: 'You cannot clone your own agent'
                })
                return
            }

            return
        }

        loading.value = true
        try {
            // Generate a new ID for the cloned agent
            const id = uuidv4()

            // Create the cloned agent data
            const clonedAgent = {
                ...agentToClone,
                id,
                name: `Copy of ${agentToClone.name}`,
                user: {
                    id: user_id.value!,
                    name: userProfile.value?.name
                },
                user_id: user_id.value!,
                created_at: Timestamp.fromDate(new Date()),
                updated_at: Timestamp.fromDate(new Date()),
                public: false, // Set to private by default
                cloned_from: {
                    id: agentToClone.id,
                    name: agentToClone.name,
                    user_id: agentToClone.user_id
                }
            }

            // Save the cloned agent to Firestore
            await setFirestoreDocument('agents', id, clonedAgent)

            // Show success message
            useAlert().openAlert({
                type: 'SUCCESS',
                msg: 'Agent cloned successfully'
            })

            // Navigate to the new agent's page
            router.push(`/agents/list/${id}`)
        } catch (error: any) {
            useAlert().openAlert({
                type: 'ERROR',
                msg: `Error cloning agent: ${error.message}`
            })
        } finally {
            loading.value = false
        }
    }

    return { cloneAgent, loading, canCloneAgent }
}
