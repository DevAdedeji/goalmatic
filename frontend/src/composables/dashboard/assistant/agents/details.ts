import { ref, watch, nextTick, Ref, computed } from 'vue'
import { formattedAvailableTools } from './tools/list'
import { agentToolConfigs } from '@/composables/dashboard/assistant/agents/tools/config'

// Centralized state management for agent details
// These are exported so edit.ts can use them directly
export const titleInputRef = ref<HTMLInputElement | null>(null)
export const titlePopoverOpen = ref(false)
export const currentTitle = ref('')
export const isEditingDescription = ref(false)
export const descriptionModel = ref('')
export const systemInfoModel = ref('')
export const isEditingSystemInfo = ref(false)
export const isEditingTools = ref(false)
export const toolsModel = ref([] as any[])
export const isEditingName = ref(false)
export const nameModel = ref('')
export const toolSearch = ref('')
export const UserIntegrations = ref<Record<string, any>[]>([])

// Computed property for filtered tools
export const filteredTools = computed(() => {
  return formattedAvailableTools(UserIntegrations.value).filter((tool) => {
    return tool.name.toLowerCase().includes(toolSearch.value.toLowerCase())
  })
})

export function useAgentDetails() {
  // Watch function to update models when agent details change
  const setupWatchers = (agentDetails: Ref<any>) => {
    // Update models when agent details change
    watch(() => agentDetails.value, (newValue) => {
      if (newValue) {
        // Update title model
        if (newValue.name !== undefined) {
          currentTitle.value = newValue.name
          nameModel.value = newValue.name
        }

        // Update description model
        if (newValue.description !== undefined) {
          descriptionModel.value = newValue.description
        }

        // Update system info model
        if (newValue.spec?.systemInfo !== undefined) {
          systemInfoModel.value = newValue.spec.systemInfo
        }

        // Update tools model and config
        if (newValue.spec?.tools !== undefined) {
          toolsModel.value = [...newValue.spec.tools]
          agentToolConfigs.value = newValue.spec?.toolsConfig || {}
        }
      }
    }, { immediate: true })
  }

  // Tool functions
  const removeTool = (toolsModel: Ref<any[]>, toolToRemove: { id: string }) => {
    return toolsModel.value.filter((tool) => tool.id !== toolToRemove.id)
  }

  // Title popover functions
  const openTitlePopover = () => {
    titlePopoverOpen.value = true
    nextTick(() => {
      titleInputRef.value?.focus()
    })
  }

  const saveTitle = async (id: string, updateName: (id: string, title: string) => Promise<void>) => {
    if (currentTitle.value.trim()) {
      await updateName(id, currentTitle.value)
      titlePopoverOpen.value = false
    }
  }

  // Description functions
  const editDescription = (agentDetails: Ref<any>) => {
    isEditingDescription.value = true
    descriptionModel.value = agentDetails.value?.description || ''
  }

  const cancelEditDescription = (agentDetails: any) => {
    isEditingDescription.value = false
    // Reset the model to the original content
    descriptionModel.value = agentDetails?.description || ''
  }

  const saveDescription = async (id: string, updateDescription: (id: string, description: string) => Promise<void>) => {
    if (descriptionModel.value.trim()) {
      await updateDescription(id, descriptionModel.value)
      isEditingDescription.value = false
    }
  }

  // System info functions
  const editSystemInfo = (agentDetails: Ref<any>) => {
    isEditingSystemInfo.value = true
    systemInfoModel.value = agentDetails.value?.spec?.systemInfo || ''
  }

  const editTools = (agentDetails: Ref<any>) => {
    isEditingTools.value = true
    toolsModel.value = [...(agentDetails.value?.spec?.tools || [])]
  }

  const cancelEdit = (agentDetails: Ref<any>) => {
    // Determine which edit mode is active and reset accordingly
    if (isEditingSystemInfo.value) {
      isEditingSystemInfo.value = false
      // Reset the model to the original content
      systemInfoModel.value = agentDetails.value?.spec?.systemInfo || ''
    }

    if (isEditingTools.value) {
      isEditingTools.value = false
      // Reset the tools model to the original content
      toolsModel.value = [...(agentDetails.value?.spec?.tools || [])]
    }
  }

  // Reset all editing states
  const resetEditingStates = () => {
    isEditingDescription.value = false
    isEditingSystemInfo.value = false
    isEditingTools.value = false
    isEditingName.value = false
  }

  return {
    // Refs
    titleInputRef,
    titlePopoverOpen,
    currentTitle,
    isEditingDescription,
    descriptionModel,
    systemInfoModel,
    isEditingSystemInfo,
    isEditingTools,
    toolsModel,
    isEditingName,
    nameModel,
    toolSearch,
    UserIntegrations,
    filteredTools,

    // Functions
    setupWatchers,
    removeTool,
    openTitlePopover,
    saveTitle,
    editDescription,
    cancelEditDescription,
    saveDescription,
    editSystemInfo,
    editTools,
    cancelEdit,
    resetEditingStates
  }
}
