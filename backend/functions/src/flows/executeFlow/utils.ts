import { goals_db } from '../../init';


export const verifyExecuteFlowData = async (flowId: string, userId: string, executionId: string) => {
        if (!flowId || !userId || !executionId) {
        console.error('Missing required parameters:', { flowId, userId, executionId });
        return {isValid: false, error: 'Missing required parameters: flowId, userId, or executionId'}
        }
        const flowDoc = await goals_db.collection('flows').doc(flowId).get();

    if (!flowDoc.exists) {
        console.error(`Flow not found: ${flowId}`);
        return {isValid: false, error: 'Flow not found'}
    }

    const flowData = flowDoc.data();

    if (!flowData || !flowData.steps) {
        console.error(`Flow data or steps are undefined for flow: ${flowId}`);
        return {isValid: false, error: 'Flow data or steps are undefined'}
    }

    return {isValid: true, flowData}
}