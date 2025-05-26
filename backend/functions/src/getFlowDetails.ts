import { onCall, HttpsError } from 'firebase-functions/v2/https'
import { goals_db, is_dev } from './init'

export const getFlowDetails = onCall({
    cors: true,
    region: 'us-central1',
    minInstances: is_dev ? 0 : 1 // Set minimum instances to 5 in production only
}, async (request) => {
    const { id } = request.data

    if (!id) {
        throw new HttpsError('invalid-argument', 'Please provide a flow id')
    }

    try {
        const snapshot = await goals_db.collection('flows').doc(id).get()

        if (!snapshot.exists) {
            throw new HttpsError('not-found', `This flow doesn't exist`)
        }

        const flowData = snapshot.data()!

        // Check if the flow is public or if the user is the creator
        const isPublic = flowData.public === true
        const isCreator = request.auth && request.auth.uid === flowData.creator_id

        if (!isPublic && !isCreator) {
            throw new HttpsError('permission-denied', 'You do not have permission to view this flow')
        }

        if (request.auth && request.auth.uid !== flowData.creator_id) {
            // Remove sensitive configuration data from steps
            if (flowData.steps) {
                flowData.steps = flowData.steps.map((step: any) => {
                    if (step.propsData) {
                        // Create a copy and filter sensitive data based on cloneable properties
                        const sanitizedPropsData = filterSensitiveData(step.propsData, step.node_id, step.parent_node_id)
                        
                        // Also filter AI-enabled fields to only include cloneable ones
                        const sanitizedAiEnabledFields = filterCloneableAiFields(step.aiEnabledFields || [], step.node_id, step.parent_node_id)
                        
                        return { 
                            ...step, 
                            propsData: sanitizedPropsData,
                            ...(sanitizedAiEnabledFields.length > 0 && { aiEnabledFields: sanitizedAiEnabledFields })
                        }
                    }
                    return step
                })
            }

            // Remove sensitive configuration data from trigger
            if (flowData.trigger && flowData.trigger.propsData) {
                const sanitizedTriggerProps = filterSensitiveData(flowData.trigger.propsData, flowData.trigger.node_id, flowData.trigger.parent_node_id)
                const sanitizedTriggerAiFields = filterCloneableAiFields(flowData.trigger.aiEnabledFields || [], flowData.trigger.node_id, flowData.trigger.parent_node_id)
                
                flowData.trigger.propsData = sanitizedTriggerProps
                if (sanitizedTriggerAiFields.length > 0) {
                    flowData.trigger.aiEnabledFields = sanitizedTriggerAiFields
                } else {
                    delete flowData.trigger.aiEnabledFields
                }
            }
        }
console.log(flowData);
        return {
            ...flowData,
            created_at: new Date(flowData.created_at._seconds * 1000).toISOString()
        }

    } catch (error: any) {
        throw new HttpsError('internal', `${error.message || 'An error occurred'}`)
    }
})

/**
 * Enhanced sensitive data filtering function
 */
function filterSensitiveData(propsData: Record<string, any>, nodeId: string, parentNodeId?: string): Record<string, any> {
    const sanitizedProps: Record<string, any> = {}
    
    // Get node definition to check cloneable properties
    const nodeDefinition = getNodeDefinition(nodeId, parentNodeId)
    
    if (!nodeDefinition?.props) {
        // If no node definition found, apply basic sensitive data filtering
        Object.keys(propsData).forEach(key => {
            if (isSensitiveField(key)) {
                sanitizedProps[key] = null
            } else {
                sanitizedProps[key] = propsData[key]
            }
        })
        return sanitizedProps
    }
    
    // Filter based on cloneable property and sensitive data patterns
    for (const prop of nodeDefinition.props) {
        const propKey = prop.key
        const shouldClone = prop.cloneable !== false // Default to true if not specified
        
        if (propsData.hasOwnProperty(propKey)) {
            if (shouldClone && !isSensitiveField(propKey)) {
                sanitizedProps[propKey] = propsData[propKey]
            } else {
                sanitizedProps[propKey] = null
            }
        }
    }
    
    return sanitizedProps
}

/**
 * Filter AI-enabled fields to only include cloneable ones
 */
function filterCloneableAiFields(aiEnabledFields: string[], nodeId: string, parentNodeId?: string): string[] {
    const nodeDefinition = getNodeDefinition(nodeId, parentNodeId)
    
    if (!nodeDefinition?.props) {
        return []
    }
    
    return aiEnabledFields.filter(fieldKey => {
        const prop = nodeDefinition.props.find((p: any) => p.key === fieldKey)
        return prop && prop.cloneable !== false && prop.ai_enabled === true
    })
}

/**
 * Check if a field contains sensitive information
 */
function isSensitiveField(fieldKey: string): boolean {
    const sensitivePatterns = [
        'token', 'key', 'secret', 'password', 'auth', 'credential',
        'api_key', 'access_token', 'refresh_token', 'private_key',
        'webhook_secret', 'client_secret', 'bearer_token', 'recipientEmail',
        'tableId', 'recordId', 'phoneNumber', 'userId', 'email'
    ]
    
    const lowerKey = fieldKey.toLowerCase()
    return sensitivePatterns.some(pattern => lowerKey.includes(pattern))
}

/**
 * Get node definition from available node types
 * This is a simplified version - in a real implementation, you'd want to
 * import the actual node definitions or store them in the database
 */
function getNodeDefinition(nodeId: string, parentNodeId?: string): any {
    // This is a basic implementation. In practice, you'd want to:
    // 1. Import the actual node definitions from the frontend
    // 2. Or store node definitions in the database
    // 3. Or create a shared package for node definitions
    
    // For now, return null to fall back to basic sensitive data filtering
    // You can enhance this by importing the actual node definitions
    return null
} 