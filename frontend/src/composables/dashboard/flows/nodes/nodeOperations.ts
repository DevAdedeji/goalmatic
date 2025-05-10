import { ref, computed, onMounted } from 'vue'
import { useEditFlow } from '../edit'
import { useFetchUserFlows } from '../fetch'
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

  // Check if all required props have values
  for (const prop of nodeProps) {
    if (prop.required) {
      const propValue = node.propsData?.[prop.key]
      if (propValue === undefined || propValue === null || propValue === '') {
        return false
      }
    }
  }

  return true
}

// -------------------- SELECT NODE LOGIC --------------------

/**
 * Logic for the SelectNode component
 */
export const useSelectNodeLogic = (props: any) => {
  const { addNode, editNode } = useEditFlow()

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
  const expandedNodes = ref({})

  // Initialize all nodes as expanded by default
  onMounted(() => {
    nodes.value.forEach((node) => {
      if (hasChildren(node)) {
        expandedNodes.value[node.node_id] = true
      }
    })
  })

  // Check if a node has children
  const hasChildren = (node: any) => {
    return node.children && node.children.length > 0
  }

  // Toggle node expansion
  const toggleNodeExpansion = (nodeId: string) => {
    expandedNodes.value[nodeId] = !expandedNodes.value[nodeId]
  }

  // Handle click on parent node
  const handleNodeClick = (node: any) => {
    if (hasChildren(node)) {
      toggleNodeExpansion(node.node_id)
    } else {
      // Add the node to the flow
      addNode(node, props.payload?.position)

      // Close this modal
      useFlowsModal().closeSelectNode()

      // Open the edit modal with the newly added node
      setTimeout(() => {
        // If it's a trigger node
        if (node.type === 'trigger') {
          // Get the trigger node from flowData
          const { flowData } = useFetchUserFlows()
          editNode(flowData.value.trigger)
        } else {
          // For action nodes, find the correct step based on position
          const { flowData } = useFetchUserFlows()
          const position = props.payload?.position

          // If position is specified, find the node at that position
          if (position !== undefined && position !== null) {
            editNode(flowData.value.steps[position])
          } else {
            // Otherwise, it was added at the end
            editNode(flowData.value.steps[flowData.value.steps.length - 1])
          }
        }
      }, 100) // Small delay to ensure UI updates
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
      icon: parentNode.icon
    }

    // Add the node to the flow
    addNode(mergedNode, props.payload?.position)

    // Close this modal
    useFlowsModal().closeSelectNode()

    // Open the edit modal with the newly added node
    setTimeout(() => {
      // If it's a trigger node
      if (mergedNode.type === 'trigger') {
        // Get the trigger node from flowData
        const { flowData } = useFetchUserFlows()
        editNode(flowData.value.trigger)
      } else {
        // For action nodes, find the correct step based on position
        const { flowData } = useFetchUserFlows()
        const position = props.payload?.position

        // If position is specified, find the node at that position
        if (position !== undefined && position !== null) {
          editNode(flowData.value.steps[position])
        } else {
          // Otherwise, it was added at the end
          editNode(flowData.value.steps[flowData.value.steps.length - 1])
        }
      }
    }, 100) // Small delay to ensure UI updates
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

  // Initialize the form values with existing values or defaults
  onMounted(() => {
    if (!props.payload) return

    // Initialize form values with existing values if available
    nodeProps.value.forEach((prop) => {
      if (props.payload.propsData && props.payload.propsData[prop.key] !== undefined) {
        formValues.value[prop.key] = props.payload.propsData[prop.key]
      } else if (props.payload[prop.key] !== undefined) { // Then check for direct values on the payload (for new nodes or initial values)
        formValues.value[prop.key] = props.payload[prop.key]
      } else { // Default to empty string if no value is found
        formValues.value[prop.key] = ''
      }
    })
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
    closeModal
  }
}


