import { useUser } from '@/composables/auth/user'

/**
 * Composable to check if the current user is the owner of an agent
 * This is used to conditionally show/hide features on the agent details page
 */
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
        return agent.user_id === user_id.value
    }

    return { isOwner }
}
