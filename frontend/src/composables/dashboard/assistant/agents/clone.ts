import { v4 as uuidv4 } from 'uuid'
import {
  Timestamp,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  increment
} from 'firebase/firestore'
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import {
  checkAgentToolRequirements,
  initializeToolConfigs
} from './tools/approval'
import { agentToolConfigs } from './tools/config'
import { setFirestoreDocument } from '@/firebase/firestore/create'
import { useUser } from '@/composables/auth/user'
import { useAlert } from '@/composables/core/notification'
import { useAssistantModal } from '@/composables/core/modals'
import { useFetchIntegrations } from '@/composables/dashboard/integrations/fetch'
import { callFirebaseFunction } from '@/firebase/functions'
import { db } from '@/firebase/init'

export const useCloneAgent = () => {
  const { id: user_id, userProfile, isLoggedIn } = useUser()
  const loading = ref(false)
  const router = useRouter()

  const canCloneAgent = (agent: Record<string, any>): boolean => {
    if (
      !isLoggedIn.value ||
      !user_id.value ||
      agent.creator_id === user_id.value
    )
      return false
    return true
  }


  // Function to perform the actual cloning
  const performClone = async (agentToClone: Record<string, any>) => {
    loading.value = true
    try {
      // Generate a new ID for the cloned agent
      const id = uuidv4()

      // Create a copy of the agent and exclude the last_used field
      const { last_used, ...agentDataWithoutLastUsed } = agentToClone

      // Create the cloned agent data with proper type assertion
      const clonedAgent = {
        ...agentDataWithoutLastUsed,
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

      await setFirestoreDocument('agents', id, clonedAgent)



      // Show success message
      useAlert().openAlert({
        type: 'SUCCESS',
        msg: 'Agent cloned successfully'
      })

      // Navigate to the new agent's page
      router.push(`/agents/explore/${id}`)
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
    loading.value = true
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
    const { fetchedIntegrations, fetchUserIntegrations } =
      useFetchIntegrations()
    await fetchUserIntegrations()
    const userIntegrations = fetchedIntegrations.value || []

    // Initialize tool configs heuristically and auto-clone table if referenced
    initializeToolConfigs(agentToClone)

    try {
      const hasTableTool = (agentToClone?.spec?.tools || []).some((t: any) => (t.primary_id || t.id) === 'TABLE')
      const sourceTableId = agentToClone?.spec?.toolsConfig?.TABLE?.selected_table_id
      if (hasTableTool) {
        if (sourceTableId) {
          const result = await callFirebaseFunction('cloneTableById', { tableId: sourceTableId }) as any
          const newTableId = result?.tableId
          if (newTableId) {
            agentToolConfigs.value.TABLE = agentToolConfigs.value.TABLE || {}
            agentToolConfigs.value.TABLE.selected_table_id = newTableId
          }
        } else if (agentToClone?.id) {
          const result = await callFirebaseFunction('cloneTable', { agentId: agentToClone.id }) as any
          const newTableId = result?.tableId
          if (newTableId) {
            agentToolConfigs.value.TABLE = agentToolConfigs.value.TABLE || {}
            agentToolConfigs.value.TABLE.selected_table_id = newTableId
          }
        }
      }
    } catch (_e) {
      // Continue even if table cloning fails; user can configure later
    }

    // Proceed with cloning without opening any approval modal
    await performClone(agentToClone)
  }

  return { cloneAgent, loading, canCloneAgent }
}
