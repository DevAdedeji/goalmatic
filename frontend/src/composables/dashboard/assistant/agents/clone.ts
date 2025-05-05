import { v4 as uuidv4 } from 'uuid'
import { Timestamp, doc, getDoc, setDoc, updateDoc, increment } from 'firebase/firestore'
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { checkAgentToolRequirements, initializeToolConfigs } from './tools/approval'
import { agentToolConfigs } from './tools/config'
import { setFirestoreDocument } from '@/firebase/firestore/create'
import { useUser } from '@/composables/auth/user'
import { useAlert } from '@/composables/core/notification'
import { useAssistantModal } from '@/composables/core/modals'
import { useFetchIntegrations } from '@/composables/dashboard/integrations/fetch'
import { db } from '@/firebase/init'

export const useCloneAgent = () => {
    const { id: user_id, userProfile, isLoggedIn } = useUser()
    const loading = ref(false)
    const router = useRouter()

    const canCloneAgent = (agent: Record<string, any>): boolean => {
        if (!isLoggedIn.value || !user_id.value || agent.creator_id === user_id.value) return false
        return true
    }

    /**
     * Updates the leaderboard when an agent is cloned
     * Increments the points for the original agent creator
     */
    const updateLeaderboard = async (originalCreatorId: string, creatorName: string, creatorPhotoUrl: string) => {
        try {
            // Reference to the creator's leaderboard document
            const leaderboardRef = doc(db, 'leaderboard', originalCreatorId)

            // Check if the creator already has a leaderboard entry
            const leaderboardDoc = await getDoc(leaderboardRef)

            if (leaderboardDoc.exists()) {
                // Update existing leaderboard entry
                await updateDoc(leaderboardRef, {
                    points: increment(1),
                    agents_cloned: increment(1),
                    updated_at: Timestamp.fromDate(new Date())
                })
            } else {
                // Create new leaderboard entry
                await setDoc(leaderboardRef, {
                    id: originalCreatorId,
                    name: creatorName || 'Unknown User',
                    photo_url: creatorPhotoUrl || '',
                    points: 1,
                    agents_cloned: 1,
                    created_at: Timestamp.fromDate(new Date()),
                    updated_at: Timestamp.fromDate(new Date())
                })
            }
        } catch (error: any) {
            console.error('Error updating leaderboard:', error)
            // Don't throw the error - we don't want to fail the cloning process
            // if the leaderboard update fails
        }
    }

    // Function to perform the actual cloning
    const performClone = async (agentToClone: Record<string, any>) => {
        loading.value = true
        try {
            // Generate a new ID for the cloned agent
            const id = uuidv4()

            // Create the cloned agent data with proper type assertion
            const clonedAgent = {
                ...agentToClone,
                id,
                name: `Copy of ${agentToClone.name}`,
                user: {
                    id: user_id.value!,
                    name: userProfile.value?.name
                },
                creator_id: user_id.value!,
                created_at: Timestamp.fromDate(new Date()),
                updated_at: Timestamp.fromDate(new Date()),
                public: false, // Set to private by default
                cloned_from: {
                    id: agentToClone.id,
                    name: agentToClone.name,
                    creator_id: agentToClone.creator_id
                },
                spec: {
                    ...(agentToClone.spec || {}),
                    toolsConfig: { ...agentToolConfigs.value }
                }
            }

            // Save the cloned agent to Firestore
            await setFirestoreDocument('agents', id, clonedAgent)

            // Update the leaderboard for the original creator
            if (agentToClone.creator_id) {
                // Get the original creator's name and photo URL
                const creatorDoc = await getDoc(doc(db, 'users', agentToClone.creator_id))
                const creatorData = creatorDoc.data()

                await updateLeaderboard(
                    agentToClone.creator_id,
                    creatorData?.name || 'Unknown User',
                    creatorData?.photo_url || ''
                )
            }

            // Show success message
            useAlert().openAlert({
                type: 'SUCCESS',
                msg: 'Agent cloned successfully'
            })

            // Navigate to the new agent's page
            router.push(`/agents/list/${id}`)
            return true
        } catch (error: any) {
            useAlert().openAlert({
                type: 'ERROR',
                msg: `Error cloning agent: ${error.message}`
            })
            return false
        } finally {
            loading.value = false
        }
    }

    const cloneAgent = async (agentToClone: Record<string, any>) => {
        // Check if user can clone this agent
        if (!canCloneAgent(agentToClone)) {
            if (!isLoggedIn.value) {
                useAlert().openAlert({
                    type: 'ERROR',
                    msg: 'You must be logged in to clone an agent',
                    position: 'bottom-right'
                })
                return
            }

            if (agentToClone.creator_id === user_id.value) {
                useAlert().openAlert({
                    type: 'ERROR',
                    msg: 'You cannot clone your own agent'
                })
                return
            }

            return
        }

        // Fetch user integrations to check for required integrations
        const { fetchedIntegrations, fetchUserIntegrations } = useFetchIntegrations()
        await fetchUserIntegrations()
        const userIntegrations = fetchedIntegrations.value || []

        // Check if the agent has tools that require configuration or integrations
        const { hasRequiredTools, toolsRequiringConfig } = checkAgentToolRequirements(agentToClone, userIntegrations)

        if (hasRequiredTools) {
            // Initialize tool configs from the agent being cloned
            initializeToolConfigs(agentToClone)

            // Open the tool approval modal
            useAssistantModal().openToolApprovalModal({
                agent: agentToClone,
                toolsRequiringConfig,
                userIntegrations,
                refreshUserIntegrations: async () => {
                    // Refresh user integrations
                    await fetchUserIntegrations()
                    return fetchedIntegrations.value
                },
                onConfirm: () => performClone(agentToClone)
            })
        } else {
            // No tool configuration or integrations needed, proceed with cloning
            await performClone(agentToClone)
        }
    }

    return { cloneAgent, loading, canCloneAgent }
}
