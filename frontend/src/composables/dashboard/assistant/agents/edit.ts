import { Timestamp } from 'firebase/firestore'
import { ref, computed, watch } from 'vue'
import { useEditToolConfig } from './tools/config'
import { updateFirestoreDocument } from '@/firebase/firestore/edit'
import { useAlert } from '@/composables/core/notification'
import { formattedAvailableTools } from '~/src/composables/dashboard/assistant/agents/tools/list'
import { useSelectAgent } from '@/composables/dashboard/assistant/agents/select'
import { useFetchIntegrations } from '@/composables/dashboard/integrations/fetch'
import { useAssistantModal } from '@/composables/core/modals'

const isEditingSystemInfo = ref(false)
const systemInfoModel = ref('')
const isEditingTools = ref(false)
const toolsModel = ref([] as any[])
const isEditingName = ref(false)
const nameModel = ref('')
const isEditingDescription = ref(false)
const descriptionModel = ref('')
const toolSearch = ref('')
const UserIntegrations = ref<Record<string, any>[]>([])

const filteredTools = computed(() => {
    return formattedAvailableTools(UserIntegrations.value).filter((tool) => {
        return tool.name.toLowerCase().includes(toolSearch.value.toLowerCase())
    })
})

export const useEditAgent = () => {
    const updateNameLoading = ref(false)
    const updateDescriptionLoading = ref(false)
    const updateSystemInfoLoading = ref(false)
    const updateToolsLoading = ref(false)
    const toggleVisibilityLoading = ref(false)
    const { selectedAgent } = useSelectAgent()
    const { getConfiguredTools } = useEditToolConfig()

    watch(isEditingTools, async () => {
        if (isEditingTools.value) {
            const { fetchedIntegrations, fetchUserIntegrations } = useFetchIntegrations()
            await fetchUserIntegrations()
            UserIntegrations.value = fetchedIntegrations.value
        }
    })

    const updateSystemInfo = async (id: string, spec: any) => {
        try {
            updateSystemInfoLoading.value = true

            await updateFirestoreDocument('agents', id, {
                spec: {
                    ...spec,
                    // Strip any potentially dangerous HTML tags while preserving basic formatting
                    systemInfo: systemInfoModel.value.replace(/<(?!\/?(p|br|strong|em|u|s|ul|ol|li|h[1-6]|blockquote)(?=>|\s.*>))\/?.*?>/g, '')
                }
            })

            isEditingSystemInfo.value = false
            updateSystemInfoLoading.value = false
            useAlert().openAlert({ type: 'SUCCESS', msg: 'System information updated successfully' })
        } catch (error) {
            updateSystemInfoLoading.value = false
            useAlert().openAlert({ type: 'ERROR', msg: `Error: ${error}` })
        }
    }

    const updateTools = async (id: string, spec: any) => {
        try {
            updateToolsLoading.value = true

            // Get configured tools
            const configuredTools = getConfiguredTools()

            await updateFirestoreDocument('agents', id, {
                spec: {
                    ...spec,
                    tools: toolsModel.value,
                    toolsConfig: configuredTools
                }
            })

            isEditingTools.value = false
            updateToolsLoading.value = false
            useAlert().openAlert({ type: 'SUCCESS', msg: 'Tools updated successfully' })
        } catch (error) {
            updateToolsLoading.value = false
            useAlert().openAlert({ type: 'ERROR', msg: `Error: ${error}` })
        }
    }

    /**
     * Toggle agent visibility between public and private
     * @param agent The agent to toggle visibility for
     */
    const toggleAgentVisibility = async (agent: Record<string, any>) => {
        if (!agent || !agent.id) {
            useAlert().openAlert({ type: 'ERROR', msg: 'Invalid agent data' })
            return
        }

        toggleVisibilityLoading.value = true
        try {
            // Toggle the public flag
            const isPublic = agent.public === true

            await updateFirestoreDocument('agents', agent.id, {
                public: !isPublic,
                updated_at: Timestamp.fromDate(new Date())
            })

            // Update the local agent object to reflect the change
            agent.public = !isPublic

            useAlert().openAlert({
                type: 'SUCCESS',
                msg: `Agent is now ${!isPublic ? 'public' : 'private'}`
            })
        } catch (error) {
            console.error('Error toggling agent visibility:', error)
            useAlert().openAlert({ type: 'ERROR', msg: `Error: ${error}` })
        } finally {
            toggleVisibilityLoading.value = false
        }
    }


    const updateName = async (id: string, name: string) => {
        try {
            updateNameLoading.value = true

            await updateFirestoreDocument('agents', id, {
                name: name.trim(),
                updated_at: Timestamp.fromDate(new Date())
            })

            isEditingName.value = false
            updateNameLoading.value = false
            useAlert().openAlert({ type: 'SUCCESS', msg: 'Agent name updated successfully' })
        } catch (error) {
            updateNameLoading.value = false
            useAlert().openAlert({ type: 'ERROR', msg: `Error: ${error}` })
        }
    }

    const updateDescription = async (id: string, description: string) => {
        try {
            updateDescriptionLoading.value = true

            await updateFirestoreDocument('agents', id, {
                description: description.trim(),
                updated_at: Timestamp.fromDate(new Date())
            })

            isEditingDescription.value = false
            updateDescriptionLoading.value = false
            useAlert().openAlert({ type: 'SUCCESS', msg: 'Agent description updated successfully' })
        } catch (error) {
            updateDescriptionLoading.value = false
            useAlert().openAlert({ type: 'ERROR', msg: `Error: ${error}` })
        }
    }

    const openVisibilityConfirmation = (agent: Record<string, any>) => {
        useAssistantModal().openConfirmVisibility({
            agent,
            onConfirm: () => toggleAgentVisibility(agent)
        })
    }

    return {
        systemInfoModel, nameModel, descriptionModel, openVisibilityConfirmation,
        updateSystemInfoLoading, updateToolsLoading, updateNameLoading, updateDescriptionLoading, toggleVisibilityLoading,
        updateSystemInfo, updateTools, updateName, updateDescription, toggleAgentVisibility,
        isEditingSystemInfo, isEditingTools, isEditingName, isEditingDescription,
        toolsModel, filteredTools, toolSearch
    }
}
