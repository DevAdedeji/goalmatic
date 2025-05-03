import { useUser } from '@/composables/auth/user'


export const useAgentOwner = () => {
    const { id: user_id, isLoggedIn } = useUser()

    /**
     * Check if the current user is the owner of the agent
     * @param agent The agent object to check
     * @returns boolean indicating if the current user is the owner
     */
    const isOwner = (agent: Record<string, any>): boolean => {
        // If user is not logged in, they can't be the owner
        if (!isLoggedIn.value || !user_id.value) {
            return false
        }

        // Check if the agent belongs to the current user
        return agent.creator_id === user_id.value
    }

    return { isOwner }
}
