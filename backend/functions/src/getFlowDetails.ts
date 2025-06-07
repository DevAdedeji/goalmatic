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


        const isPublic = flowData.public === true
        const isCreator = request.auth && request.auth.uid === flowData.creator_id

        if (!isPublic && !isCreator) {
            throw new HttpsError('permission-denied', 'You do not have permission to view this flow')
        }

        if (!isCreator) {
            if (flowData.steps) {
                flowData.steps = flowData.steps.map((step: any) => {
                    if (step.propsData) {
                        const sanitizedPropsData = filterSensitiveData(step.propsData, step.nonCloneables)
                        
                        return { 
                            ...step, 
                            propsData: sanitizedPropsData,
                        }
                    }
                    return step
                })
            }


            if (flowData.trigger && flowData.trigger.propsData) {
                const sanitizedTriggerProps = filterSensitiveData(flowData.trigger.propsData,  flowData.trigger.nonCloneables)
                flowData.trigger.propsData = sanitizedTriggerProps
            }
        }
        return {
            ...flowData,
            created_at: convertTimestamp(flowData.created_at)
        }

    } catch (error: any) {
        console.log(error);
        throw new HttpsError('internal', `${error.message || 'An error occurred'}`)
    }
})


function filterSensitiveData(propsData: Record<string, any>, nonCloneables?: string[]): Record<string, any> {
    const sanitizedProps: Record<string, any> = {}
    Object.keys(propsData).forEach(key => {
        if (nonCloneables && nonCloneables.includes(key)) {
            sanitizedProps[key] = null
        } else {
            sanitizedProps[key] = propsData[key]
        }
    })
    
    return sanitizedProps
}

/**
 * Helper function to convert Firestore timestamp to ISO string
 */
function convertTimestamp(timestamp: any): string | null {
    if (!timestamp) {
        return null;
    }
    
    // Handle Firestore Timestamp with _seconds property
    if (timestamp._seconds) {
        return new Date(timestamp._seconds * 1000).toISOString();
    }
    
    // Handle Firestore Timestamp with toDate method
    if (timestamp.toDate && typeof timestamp.toDate === 'function') {
        return timestamp.toDate().toISOString();
    }
    
    // Handle regular Date object
    if (timestamp instanceof Date) {
        return timestamp.toISOString();
    }
    
    // Handle string that might already be an ISO string
    if (typeof timestamp === 'string') {
        try {
            const date = new Date(timestamp);
            if (!isNaN(date.getTime())) {
                return date.toISOString();
            }
        } catch (e) {
            // Invalid date string
        }
    }
    
    // Return as is if we can't convert
    return timestamp;
}




