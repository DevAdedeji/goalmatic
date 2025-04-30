import { v4 as uuidv4 } from 'uuid'
import { Timestamp } from 'firebase/firestore'
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { checkAgentToolRequirements, initializeToolConfigs } from './tools/approval'
import { agentToolConfigs } from './tools/config'
import { setFirestoreDocument } from '@/firebase/firestore/create'
import { useUser } from '@/composables/auth/user'
import { useAlert } from '@/composables/core/notification'
import { useAssistantModal } from '@/composables/core/modals'
import { useFetchIntegrations } from '@/composables/dashboard/integrations/fetch'

export const useCloneAgent = () => {
    const { id: user_id, userProfile, isLoggedIn } = useUser()
    const loading = ref(false)
    const router = useRouter()

    const canCloneAgent = (agent: Record<string, any>): boolean => {
        if (!isLoggedIn.value || !user_id.value || agent.user_id === user_id.value) return false
        return true
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
                user_id: user_id.value!,
                created_at: Timestamp.fromDate(new Date()),
                updated_at: Timestamp.fromDate(new Date()),
                public: false, // Set to private by default
                cloned_from: {
                    id: agentToClone.id,
                    name: agentToClone.name,
                    user_id: agentToClone.user_id
                },
                spec: {
                    ...(agentToClone.spec || {}),
                    toolsConfig: { ...agentToolConfigs.value }
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

            if (agentToClone.user_id === user_id.value) {
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
