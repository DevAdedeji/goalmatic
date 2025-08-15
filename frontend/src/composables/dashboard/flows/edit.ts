import { Timestamp, collection, getDocs, orderBy, query } from 'firebase/firestore'
import { v4 as uuidv4 } from 'uuid'
import { useFlowLogs } from './logs'
import { useFetchFlowById } from './id'
import { updateFirestoreDocument } from '@/firebase/firestore/edit'
import { useUser } from '@/composables/auth/user'
import { useAlert } from '@/composables/core/notification'
import { useFlowsModal } from '@/composables/core/modals'
import { useConfirmationModal } from '@/composables/core/confirmation'

export const useEditFlow = () => {
  const { id: user_id } = useUser()
  const loading = ref(false)
  const toggleVisibilityLoading = ref(false)

  // Get flow runs functionality from the dedicated composable
  const { flowLogs, flowLogsLoading, fetchFlowLogs } = useFlowLogs()

  const { flowDetails } = useFetchFlowById()

  /**
   * Open confirmation modal for visibility toggle
   * @param flow The flow to toggle visibility for
   */
  const openVisibilityConfirmation = (flow: Record<string, any>) => {
    const isPublic = flow.public === true
    const newVisibility = isPublic ? 'private' : 'public'

    useConfirmationModal().openAlert({
      type: 'Alert',
      title: `Make Flow ${newVisibility === 'public' ? 'Public' : 'Private'}`,
      desc: `Are you sure you want to make "${flow.name}" ${newVisibility}? ${newVisibility === 'public' ? 'Anyone will be able to view and clone this flow.' : 'Only you will be able to view this flow.'}`,
      call_function: () => toggleFlowVisibility(flow),
      loading: toggleVisibilityLoading
    })
  }

  /**
   * Toggle flow visibility between public and private
   * @param flow The flow to toggle visibility for
   */
  const toggleFlowVisibility = async (flow: Record<string, any>) => {
    if (!flow || !flow.id) {
      useAlert().openAlert({ type: 'ERROR', msg: 'Invalid flow data' })
      return
    }

    toggleVisibilityLoading.value = true
    try {
      // Toggle the public flag
      const isPublic = flow.public === true

      await updateFirestoreDocument('flows', flow.id, {
        public: !isPublic,
        updated_at: Timestamp.fromDate(new Date())
      })

      // Update the local flow object to reflect the change
      flow.public = !isPublic

      // Also update the local flowDetails to reflect the change immediately
      if (flowDetails.value && flowDetails.value.id === flow.id) {
        flowDetails.value.public = !isPublic
      }

      useAlert().openAlert({
        type: 'SUCCESS',
        msg: `Flow is now ${!isPublic ? 'public' : 'private'}`
      })
    } catch (error) {
      console.error('Error toggling flow visibility:', error)
      useAlert().openAlert({ type: 'ERROR', msg: `Error: ${error}` })
    } finally {
      toggleVisibilityLoading.value = false
      useConfirmationModal().closeAlert()
    }
  }

  const updateFlow = async (data: Record<string, any>) => {
    if (!user_id.value) return

    // Check if user is authorized to edit this flow
    if (data.creator_id !== user_id.value) {
      useAlert().openAlert({ type: 'ERROR', msg: 'You do not have permission to edit this flow' })
      return
    }

    loading.value = true
    try {
      const sent_data = {
        ...data,
        updated_at: Timestamp.fromDate(new Date())
      } as Record<string, any>

      // Process steps to ensure proper data structure and clonable fields
      sent_data.steps = (sent_data.steps || []).map((step: Record<string, any>) => {
        const { props, ...rest } = step

        // Ensure clonable data fields are properly structured
        const processedStep = {
          ...rest,
          // Preserve propsData with all configured values
          propsData: step.propsData || {},
          // Preserve aiEnabledFields array for AI-enabled properties
          ...(step.aiEnabledFields && step.aiEnabledFields.length > 0 && { aiEnabledFields: step.aiEnabledFields })
        }

        return processedStep
      })

      // Same for trigger - ensure proper data structure
      if (sent_data.trigger) {
        const { props, ...rest } = sent_data.trigger
        sent_data.trigger = {
          ...rest,
          // Preserve propsData with all configured values
          propsData: sent_data.trigger.propsData || {},
          // Preserve aiEnabledFields array for AI-enabled properties
          ...(sent_data.trigger.aiEnabledFields && sent_data.trigger.aiEnabledFields.length > 0 && { aiEnabledFields: sent_data.trigger.aiEnabledFields })
        }
      }

      await updateFirestoreDocument('flows', sent_data.id, sent_data)

      // Update the local flowDetails to reflect changes immediately
      flowDetails.value = { ...sent_data }

      useAlert().openAlert({ type: 'SUCCESS', msg: 'Flow updated successfully' })
    } catch (error: any) {
      console.error('Error updating flow:', error)
      useAlert().openAlert({ type: 'ERROR', msg: `Error updating flow: ${error.message}` })
    } finally {
      loading.value = false
    }
  }

  // Add a step to a flow
  const addStepToFlow = async (flow: Record<string, any>, step: Record<string, any>) => {
    const steps = [...(flow.steps || []), step]
    await updateFlow({
      ...flow,
      steps
    })
  }

  // Remove a step from a flow
  const removeStepFromFlow = async (flow: Record<string, any>, stepIndex: number) => {
    const steps = [...(flow.steps || [])]
    steps.splice(stepIndex, 1)
    await updateFlow({
      ...flow,
      steps
    })
  }

  // Update a specific step in a flow
  const updateStepInFlow = async (flow: Record<string, any>, stepIndex: number, updatedStep: Record<string, any>) => {
    const steps = [...(flow.steps || [])]
    steps[stepIndex] = updatedStep
    await updateFlow({
      ...flow,
      steps
    })
  }

  const isFlowValid = computed(() => {
    const hasTrigger = flowDetails.value?.trigger !== undefined && flowDetails.value?.trigger !== null
    const hasActionSteps = flowDetails.value?.steps && flowDetails.value?.steps.length > 0
    return hasTrigger && hasActionSteps
  })

  const saveFlow = async () => {
    await updateFlow(flowDetails.value)
  }

  const addNode = (node: Record<string, any>, position: number | null) => {
    if (node.type === 'trigger') {
      flowDetails.value.trigger = node
      return
    }

    if (position === undefined || position === null) {
      flowDetails.value.steps.push({ position: flowDetails.value.steps.length + 1, ...node, id: uuidv4() })
      return
    }

    flowDetails.value.steps.splice(position, 0, { position, ...node, id: uuidv4() })
  }

  const removeNode = async (node: Record<string, any>, position?: number | null) => {
    if (node.type === 'trigger') {
      flowDetails.value.trigger = null
      return
    }

    if (position !== undefined && position !== null) {
      flowDetails.value.steps = flowDetails.value.steps.slice(0, position).concat(flowDetails.value.steps.slice(position + 1))
    } else {
      flowDetails.value.steps = flowDetails.value.steps.filter((step: Record<string, any>) => step.id !== node.id)
    }
    await updateFlow(flowDetails.value)
  }
  const confirmRemoveNode = async (node, position?: number) => {
    useConfirmationModal().openAlert({
      type: 'Alert',
      title: 'Delete Step',
      desc: 'Are you sure you want to delete this step?',
      call_function: async () => {
        loading.value = true
        await removeNode(node, position)
        useConfirmationModal().closeAlert()
        loading.value = false
      },
      loading
    })
  }

  const editNode = (node: Record<string, any>) => {
    useFlowsModal().openEditNode(node)
  }

  // Update a node with new values
  const updateNode = async (node: Record<string, any>, updatedValues: Record<string, any>) => {
    // Extract aiEnabledFields from updatedValues if present
    const { aiEnabledFields, ...propsData } = updatedValues

    const updatedNode = {
      ...node,
      propsData,
      ...(aiEnabledFields && { aiEnabledFields })
    }


    // If it's a trigger node
    if (node.type === 'trigger') {
      flowDetails.value.trigger = updatedNode
      await updateFlow(flowDetails.value)
      return
    }

    // If it's an action node, find it in the steps and update it
    const stepIndex = flowDetails.value.steps.findIndex((step: Record<string, any>) => {
      if (step.id && node.id) {
        return step.id === node.id
      }
      return false
    })

    if (stepIndex !== -1) {
      flowDetails.value.steps[stepIndex] = updatedNode
      await updateFlow(flowDetails.value)
    }
  }

  const handleChangeNode = (step, index, type) => {
    // Do not delete first. Open select modal in replacement mode and perform replacement after selection
    useFlowsModal().openSelectNode({
      type,
      position: index,
      isReplacement: true,
      replaceTargetId: step?.id || null
    })
  }

  // Move step up in the flow
  const moveStepUp = async (stepIndex: number) => {
    if (stepIndex <= 0 || stepIndex >= flowDetails.value.steps.length) return

    const steps = [...flowDetails.value.steps]
    // Swap with previous step
    const temp = steps[stepIndex]
    steps[stepIndex] = steps[stepIndex - 1]
    steps[stepIndex - 1] = temp

    flowDetails.value.steps = steps
    await updateFlow(flowDetails.value)
  }

  // Move step down in the flow
  const moveStepDown = async (stepIndex: number) => {
    if (stepIndex < 0 || stepIndex >= flowDetails.value.steps.length - 1) return

    const steps = [...flowDetails.value.steps]
    // Swap with next step
    const temp = steps[stepIndex]
    steps[stepIndex] = steps[stepIndex + 1]
    steps[stepIndex + 1] = temp

    flowDetails.value.steps = steps
    await updateFlow(flowDetails.value)
  }


  return {
    loading,
    flowLogs,
    flowLogsLoading,
    fetchFlowLogs,
    updateFlow,
    addStepToFlow,
    removeStepFromFlow,
    updateStepInFlow,
    isFlowValid,
    saveFlow,
    addNode,
    removeNode,
    editNode,
    updateNode,
    handleChangeNode,
    confirmRemoveNode,
    openVisibilityConfirmation,
    toggleFlowVisibility,
    toggleVisibilityLoading,
    moveStepUp,
    moveStepDown
  }
}
