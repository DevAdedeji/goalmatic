import { useEditFlow } from '../edit'
import { useFetchFlowById } from '../id'
import { flowTriggerNodes, flowActionNodes } from './list'
import { useFlowsModal } from '@/composables/core/modals'
import { useAlert } from '@/composables/core/notification'

// Shared loading state
const loading = ref(false)

/**
 * Check if a node is valid (has all required props filled)
 */
export const isNodeValid = (node: Record<string, any>) => {
  if (!node) return true // No node means nothing to validate

  // Get the node props - either directly from the node or find them
  let nodeProps = node.props || []

  // For child nodes, find their props from the parent node's children
  if (node.parent_node_id && node.node_id) {
    const parentNodes = node.type === 'trigger' ? flowTriggerNodes : flowActionNodes
    const parentNode = parentNodes.find((n) => n.node_id === node.parent_node_id)

    if (parentNode && parentNode.children) {
      const childNode = parentNode.children.find((c) => c.node_id === node.node_id)
      if (childNode?.props) {
        nodeProps = childNode.props
      }
    }
  }

  // If no props defined, consider it valid
  if (!nodeProps || nodeProps.length === 0) return true

  // Check if all required props have values or are AI-enabled
  for (const prop of nodeProps) {
    if (prop.required) {
      const propValue = node.propsData?.[prop.key]
      const isAiEnabled = node.aiEnabledFields && node.aiEnabledFields.includes(prop.key)

      // If AI is enabled for this prop, consider it valid regardless of manual input
      if (isAiEnabled) {
        continue
      }

      // Otherwise, check if manual input is provided
      if (propValue === undefined || propValue === null || propValue === '') {
        return false
      }
    }
  }

  return true
}

/**
 * Get missing required props for a node (accounting for AI-enabled fields)
 */
export const getMissingRequiredProps = (node: Record<string, any>) => {
  if (!node) return []

  // Get the node props - either directly from the node or find them
  let nodeProps = node.props || []

  // For child nodes, find their props from the parent node's children
  if (node.parent_node_id && node.node_id) {
    const parentNodes = node.type === 'trigger' ? flowTriggerNodes : flowActionNodes
    const parentNode = parentNodes.find((n) => n.node_id === node.parent_node_id)

    if (parentNode && parentNode.children) {
      const childNode = parentNode.children.find((c) => c.node_id === node.node_id)
      if (childNode?.props) {
        nodeProps = childNode.props
      }
    }
  }

  // If no props defined, no missing props
  if (!nodeProps || nodeProps.length === 0) return []

  // Filter for missing required props
  return nodeProps.filter((prop) => {
    if (prop.required) {
      const propValue = node.propsData?.[prop.key]
      const isAiEnabled = node.aiEnabledFields && node.aiEnabledFields.includes(prop.key)

      // If AI is enabled for this prop, consider it valid (not missing)
      if (isAiEnabled) {
        return false
      }

      // Otherwise, check if manual input is missing
      return propValue === undefined || propValue === null || propValue === ''
    }
    return false
  })
}

// -------------------- SELECT NODE LOGIC --------------------

/**
 * Logic for the SelectNode component
 */
export const useSelectNodeLogic = (props: any) => {
  const { addNode, editNode, updateFlow } = useEditFlow()
  const { flowDetails } = useFetchFlowById()

  // Get nodes based on type
  const nodes = computed(() => {
    switch (props.payload?.type) {
      case 'trigger':
        return flowTriggerNodes
      case 'action':
        return flowActionNodes
      default:
        return []
    }
  })

  // Track expanded state of each parent node (open by default)
  const expandedNodes = ref<Record<string, boolean>>({})

  // Check if a node has children
  const hasChildren = (node: any) => {
    return node.children && node.children.length > 0
  }

  // Initialize all nodes as expanded by default
  onMounted(() => {
    nodes.value.forEach((node) => {
      if (hasChildren(node) && node.node_id !== undefined) {
        expandedNodes.value[node.node_id] = true
      }
    })
  })

  // Toggle node expansion
  const toggleNodeExpansion = (nodeId: string) => {
    expandedNodes.value[nodeId] = !expandedNodes.value[nodeId]
  }

  // Handle click on parent node
  const handleNodeClick = (node: any) => {
    if (hasChildren(node)) {
      toggleNodeExpansion(node.node_id)
    } else {
      // If we're replacing, do an in-place replace; otherwise add
      const isReplacement = !!props.payload?.isReplacement
      const position = props.payload?.position
      const replaceTargetId = props.payload?.replaceTargetId

      if (isReplacement) {
        if (node.type === 'trigger') {
          // Replace trigger in place
          flowDetails.value.trigger = { ...node, id: flowDetails.value.trigger?.id || node.id }
        } else if (position !== undefined && position !== null) {
          // Replace action at the given index preserving id
          const existing = flowDetails.value.steps[position]
          const preservedId = existing?.id
          flowDetails.value.steps.splice(position, 1, { ...node, id: preservedId || node.id })
        } else if (replaceTargetId) {
          const idx = (flowDetails.value.steps || []).findIndex((s: any) => s.id === replaceTargetId)
          if (idx !== -1) {
            const preservedId = flowDetails.value.steps[idx]?.id
            flowDetails.value.steps.splice(idx, 1, { ...node, id: preservedId || node.id })
          } else {
            // Fallback to append if not found
            addNode(node, null)
          }
        } else {
          // Fallback when info missing
          addNode(node, position ?? null)
        }

        // Persist and open editor on the replaced node
        updateFlow(flowDetails.value)
        useFlowsModal().closeSelectNode()
        setTimeout(() => {
          if (node.type === 'trigger') {
            editNode(flowDetails.value.trigger)
          } else if (position !== undefined && position !== null) {
            editNode(flowDetails.value.steps[position])
          } else if (replaceTargetId) {
            const idx = (flowDetails.value.steps || []).findIndex((s: any) => s.id === replaceTargetId)
            if (idx !== -1) editNode(flowDetails.value.steps[idx])
          }
        }, 100)
      } else {
        // Add flow as before
        addNode(node, position)
        useFlowsModal().closeSelectNode()
        setTimeout(() => {
          if (node.type === 'trigger') {
            editNode(flowDetails.value.trigger)
          } else {
            if (position !== undefined && position !== null) {
              editNode(flowDetails.value.steps[position])
            } else {
              editNode(flowDetails.value.steps[flowDetails.value.steps.length - 1])
            }
          }
        }, 100)
      }
    }
  }

  // Handle click on child node
  const handleChildNodeClick = (parentNode: any, childNode: any) => {
    // Create a merged node with parent properties and child specifics
    const mergedNode = {
      ...childNode,
      provider: parentNode.provider,
      category: parentNode.category,
      type: parentNode.type,
      parent_node_id: parentNode.node_id,
      name: `${parentNode.name}: ${childNode.name}`,
      description: childNode.description,
      icon: childNode.icon
    }

    const isReplacement = !!props.payload?.isReplacement
    const position = props.payload?.position
    const replaceTargetId = props.payload?.replaceTargetId

    if (isReplacement) {
      if (mergedNode.type === 'trigger') {
        flowDetails.value.trigger = { ...mergedNode, id: flowDetails.value.trigger?.id || mergedNode.id }
      } else if (position !== undefined && position !== null) {
        const existing = flowDetails.value.steps[position]
        const preservedId = existing?.id
        flowDetails.value.steps.splice(position, 1, { ...mergedNode, id: preservedId || mergedNode.id })
      } else if (replaceTargetId) {
        const idx = (flowDetails.value.steps || []).findIndex((s: any) => s.id === replaceTargetId)
        if (idx !== -1) {
          const preservedId = flowDetails.value.steps[idx]?.id
          flowDetails.value.steps.splice(idx, 1, { ...mergedNode, id: preservedId || mergedNode.id })
        } else {
          addNode(mergedNode, null)
        }
      } else {
        addNode(mergedNode, position ?? null)
      }

      updateFlow(flowDetails.value)
      useFlowsModal().closeSelectNode()
      setTimeout(() => {
        if (mergedNode.type === 'trigger') {
          editNode(flowDetails.value.trigger)
        } else if (position !== undefined && position !== null) {
          editNode(flowDetails.value.steps[position])
        } else if (replaceTargetId) {
          const idx = (flowDetails.value.steps || []).findIndex((s: any) => s.id === replaceTargetId)
          if (idx !== -1) editNode(flowDetails.value.steps[idx])
        }
      }, 100)
    } else {
      // Add flow as before
      addNode(mergedNode, position)
      useFlowsModal().closeSelectNode()
      setTimeout(() => {
        if (mergedNode.type === 'trigger') {
          editNode(flowDetails.value.trigger)
        } else {
          if (position !== undefined && position !== null) {
            editNode(flowDetails.value.steps[position])
          } else {
            editNode(flowDetails.value.steps[flowDetails.value.steps.length - 1])
          }
        }
      }, 100)
    }
  }

  // Check if we're in replacement mode
  const isReplacementMode = computed(() => !!props.payload?.isReplacement)

  // Customize the modal title
  const modalTitle = computed(() => {
    if (isReplacementMode.value) {
      return `Replace ${props.payload?.type || 'Node'}`
    }
    return `Select ${props.payload?.type || 'Node'}`
  })

  return {
    nodes,
    expandedNodes,
    hasChildren,
    toggleNodeExpansion,
    handleNodeClick,
    handleChildNodeClick,
    isReplacementMode,
    modalTitle
  }
}

// -------------------- EDIT NODE LOGIC --------------------

/**
 * Logic for the EditNode component
 */
export const useEditNodeLogic = (props: any) => {
  const { updateNode } = useEditFlow()

  // Form values will hold all the prop values
  const formValues = ref({})

  // Get the properties for the node
  const nodeProps = computed(() => {
    let nodeDef: any
    if (props.payload?.parent_node_id && props.payload?.node_id) {
      const parentNodes = props.payload.type === 'trigger' ? flowTriggerNodes : flowActionNodes
      const parentNode = parentNodes.find((n) => n.node_id === props.payload.parent_node_id)
      if (parentNode && parentNode.children) {
        const childNode = parentNode.children.find((c) => c.node_id === props.payload.node_id)
        if (childNode && 'props' in childNode) {
          nodeDef = childNode
        }
      }
    } else if (props.payload?.node_id) {
      const nodes = props.payload.type === 'trigger' ? flowTriggerNodes : flowActionNodes
      nodeDef = nodes.find((n) => n.node_id === props.payload.node_id)
    }

    return (nodeDef && Array.isArray(nodeDef.props)) ? nodeDef.props : []
  })

  const hasProps = computed(() => nodeProps.value.length > 0)

  // --- Gather previous node outputs for @ referencing ---
  const previousNodeOutputs = computed(() => {
    // Only for action nodes (not trigger)
    if (!props.payload || props.payload.type === 'trigger') return {}
    const { flowDetails } = useFetchFlowById()
    const flow = flowDetails.value
    // fallback: try to get from parent if not passed
    let steps: any[] = []
    if (flow && flow.steps) {
      steps = flow.steps as any[]
    } else if (props.steps) {
      steps = props.steps as any[]
    } else {
      steps = []
    }

    const currentIndex = steps.findIndex((step: any) => step.id === props.payload.id)
    if (currentIndex === -1) return {}
    const outputs: Record<string, any> = {}

    // Include trigger node outputs for all action nodes
    if (flow && flow.trigger) {
      const trigger = flow.trigger

      // Find the trigger node definition dynamically
      let triggerNodeDef: any = null

      // Search through all trigger nodes and their children
      for (const triggerNode of flowTriggerNodes) {
        if (triggerNode.node_id === trigger.node_id) {
          triggerNodeDef = triggerNode
          break
        }
        // Check children if it's a parent node
        if (triggerNode.children) {
          const childNode = triggerNode.children.find((child: any) => child.node_id === trigger.node_id)
          if (childNode) {
            triggerNodeDef = childNode
            break
          }
        }
      }

      // Use dynamic trigger outputs if available, otherwise fallback to generic
      if (triggerNodeDef && triggerNodeDef.expectedOutput) {
        outputs[`trigger-${trigger.node_id}`] = triggerNodeDef.expectedOutput.map((output: any) => output.key)
      } else {
        // Generic trigger output for unknown trigger types
        outputs[`trigger-${trigger.node_id}`] = [
          'trigger_data',
          'timestamp'
        ]
      }
    }

    // Include previous step outputs
    for (let i = 0; i < currentIndex; i++) {
      const step: any = steps[i]
      if (step && step.node_id !== undefined) {
        // Find the node definition in flowActionNodes
        let nodeDef: any = null
        if (step.parent_node_id) {
          // Find parent node
          const parentNode = flowActionNodes.find((n) => n.node_id === step.parent_node_id)
          if (parentNode && parentNode.children) {
            nodeDef = parentNode.children.find((c) => c.node_id === step.node_id)
          }
        } else {
          nodeDef = flowActionNodes.find((n) => n.node_id === step.node_id)
        }
        // Only include expected output keys for previous steps
        const OutputProps = nodeDef && Array.isArray(nodeDef.expectedOutput) ? nodeDef.expectedOutput.map((p: any) => p.key) : []
        outputs[`step-${i}-${step.node_id}`] = [
          ...OutputProps
        ]
      }
    }
    return outputs
  })


  // Initialize and update form values reactively when nodeProps change
  const initializeFormValues = () => {
    if (!props.payload) return

    // Initialize form values with existing values if available
    nodeProps.value.forEach((prop) => {
      // Only initialize if the property doesn't already exist in formValues
      if (formValues.value[prop.key] === undefined) {
        if (props.payload.propsData && props.payload.propsData[prop.key] !== undefined) {
          formValues.value[prop.key] = props.payload.propsData[prop.key]
        } else if (props.payload[prop.key] !== undefined) { // Then check for direct values on the payload (for new nodes or initial values)
          formValues.value[prop.key] = props.payload[prop.key]
        } else { // Default to empty string if no value is found
          formValues.value[prop.key] = ''
        }
      }
    })
  }

  // Watch for changes in nodeProps and update form values accordingly
  watch(nodeProps, () => {
    initializeFormValues()
  }, { immediate: true })

  // Also initialize on mount for safety
  onMounted(() => {
    initializeFormValues()
  })

  // Save the changes to the node
  const saveChanges = async (payload?: any) => {
    if (!props.payload) return

    loading.value = true
    try {
      // Use payload if provided (from custom node), otherwise use formValues
      const dataToSave = payload || formValues.value

      await updateNode(props.payload, dataToSave)
      closeModal()
    } catch (error: any) {
      console.error('Error saving node changes:', error)
      useAlert().openAlert({ type: 'ERROR', msg: `Error updating node: ${error.message}` })
    } finally {
      loading.value = false
    }
  }

  // Close the modal
  const closeModal = () => {
    useFlowsModal().closeEditNode()
  }

  return {
    loading,
    formValues,
    nodeProps,
    hasProps,
    saveChanges,
    closeModal,
    previousNodeOutputs
  }
}


