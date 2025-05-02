import { ref, watch, nextTick, Ref } from 'vue'
import { agentToolConfigs } from '@/composables/dashboard/assistant/agents/tools/config'

export function useAgentDetails() {
  // Refs for title popover
  const titleInputRef = ref<HTMLInputElement | null>(null)
  const titlePopoverOpen = ref(false)
  const currentTitle = ref('')

  // Description-related refs
  const isEditingDescription = ref(false)
  const descriptionModel = ref('')

  // System info related ref
  const systemInfoModel = ref('')

  // Watch function to update models when agent details change
  const setupWatchers = (agentDetails: Ref<any>) => {
    // Prefill agentToolConfigs from agentDetails.spec.tools on load
    watch(agentDetails, (newVal) => {
      if (newVal && newVal.spec && newVal.spec.tools) {
        agentToolConfigs.value = newVal.spec?.toolsConfig || {}
      }
    }, { immediate: true })

    // Update models when agent details change
    watch(() => agentDetails.value, (newValue) => {
      if (newValue) {
        // Update title model
        if (newValue.name !== undefined) {
          currentTitle.value = newValue.name
        }

        // Update description model
        if (newValue.description !== undefined) {
          descriptionModel.value = newValue.description
        }

        // Update system info model
        if (newValue.spec?.systemInfo !== undefined) {
          systemInfoModel.value = newValue.spec.systemInfo
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

  const cancelEditDescription = (agentDetails: Ref<any>) => {
    isEditingDescription.value = false
    // Reset the model to the original content
    descriptionModel.value = agentDetails.value?.description || ''
  }

  const saveDescription = async (id: string, updateDescription: (id: string, description: string) => Promise<void>) => {
    if (descriptionModel.value.trim()) {
      await updateDescription(id, descriptionModel.value)
      isEditingDescription.value = false
    }
  }

  // System info functions
  const editSystemInfo = (agentDetails: Ref<any>, isEditingSystemInfo: Ref<boolean>, systemInfoModel: Ref<string>) => {
    isEditingSystemInfo.value = true
    systemInfoModel.value = agentDetails.value?.spec?.systemInfo || ''
  }

  const editTools = (agentDetails: Ref<any>, isEditingTools: Ref<boolean>, toolsModel: Ref<any[]>) => {
    isEditingTools.value = true
    toolsModel.value = agentDetails.value?.spec?.tools || []
  }

  const cancelEdit = (agentDetails: Ref<any>, isEditingSystemInfo: Ref<boolean>, systemInfoModel: Ref<string>) => {
    isEditingSystemInfo.value = false
    // Reset the model to the original content
    systemInfoModel.value = agentDetails.value?.spec?.systemInfo || ''
  }

  return {
    titleInputRef,
    titlePopoverOpen,
    currentTitle,
    isEditingDescription,
    descriptionModel,
    systemInfoModel,
    setupWatchers,
    removeTool,
    openTitlePopover,
    saveTitle,
    editDescription,
    cancelEditDescription,
    saveDescription,
    editSystemInfo,
    editTools,
    cancelEdit
  }
}
