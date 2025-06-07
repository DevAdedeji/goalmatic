import { useUser } from '@/composables/auth/user'

export const useFlowOwner = () => {
    const { id: user_id, isLoggedIn } = useUser()

    /**
     * Check if the current user is the owner of the flow
     * @param flow The flow object to check
     * @returns boolean indicating if the current user is the owner
     */
    const isOwner = (flow: Record<string, any>): boolean => {
        // If user is not logged in, they can't be the owner
        if (!isLoggedIn.value || !user_id.value) {
            return false
        }

        // Check if the flow belongs to the current user
        return flow.creator_id === user_id.value
    }

    return { isOwner }
}
