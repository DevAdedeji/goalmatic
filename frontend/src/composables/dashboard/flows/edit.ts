import { Timestamp, collection, getDocs, orderBy, query } from 'firebase/firestore'
import { v4 as uuidv4 } from 'uuid'
import { useFetchUserFlows } from './fetch'
import { useFlowRuns } from './runs'
import { updateFirestoreDocument } from '@/firebase/firestore/edit'
import { useUser } from '@/composables/auth/user'
import { useAlert } from '@/composables/core/notification'
import { useFlowsModal } from '@/composables/core/modals'
import { useConfirmationModal } from '@/composables/core/confirmation'

export const useEditFlow = () => {
  const { id: user_id } = useUser()
  const loading = ref(false)

  // Get flow runs functionality from the dedicated composable
  const { flowRuns, flowRunsLoading, fetchFlowRuns } = useFlowRuns()

  const { flowData } = useFetchUserFlows()

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


      sent_data.steps = (sent_data.steps || []).map((step: Record<string, any>) => {
        const { props, ...rest } = step
        return { ...rest }
      })


      // Same for trigger
      if (sent_data.trigger) {
        const { props, ...rest } = sent_data.trigger
        sent_data.trigger = { ...rest }
      }





      await updateFirestoreDocument('flows', sent_data.id, sent_data)
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
    const hasTrigger = flowData.value.trigger !== undefined && flowData.value.trigger !== null
    const hasActionSteps = flowData.value.steps && flowData.value.steps.length > 0
    return hasTrigger && hasActionSteps
  })

  const saveFlow = async () => {
    await updateFlow(flowData.value)
  }

  const addNode = (node: Record<string, any>, position: number | null) => {
    if (node.type === 'trigger') {
      flowData.value.trigger = node
      return
    }

    if (!position) {
      flowData.value.steps.push({ position: flowData.value.steps.length + 1, ...node, id: uuidv4() })
      return
    }

    flowData.value.steps.splice(position, 0, { position, ...node, id: uuidv4() })
  }

  const removeNode = async (node: Record<string, any>, position?: number | null) => {
    if (node.type === 'trigger') {
      flowData.value.trigger = null
      return
    }

    if (position !== undefined && position !== null) {
      flowData.value.steps = flowData.value.steps.slice(0, position).concat(flowData.value.steps.slice(position + 1))
    } else {
      flowData.value.steps = flowData.value.steps.filter((step: Record<string, any>) => step.id !== node.id)
    }
    await updateFlow(flowData.value)
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
      flowData.value.trigger = updatedNode
      await updateFlow(flowData.value)
      return
    }

    // If it's an action node, find it in the steps and update it
    const stepIndex = flowData.value.steps.findIndex((step: Record<string, any>) => {
      // Compare by ID if available, otherwise fallback to a deeper comparison
      if (step.id && node.id) {
        return step.id === node.id
      }


      return false
    })

    if (stepIndex !== -1) {
      flowData.value.steps[stepIndex] = updatedNode
      await updateFlow(flowData.value)
    }
  }

  const handleChangeNode = (step, index, type) => {
	removeNode(step, index)
	useFlowsModal().openSelectNode({
		type,
		position: index,
		isReplacement: true
	})
}


  return {
    loading,
    flowRuns,
    flowRunsLoading,
    fetchFlowRuns,
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
    handleChangeNode, confirmRemoveNode
  }
}
