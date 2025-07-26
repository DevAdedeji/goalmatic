import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { v4 as uuidv4 } from 'uuid';
import { availableNodes } from '../executeFlow/flowSteps/list';
import { WorkflowContext } from '@upstash/workflow';

/**
 * Test a single node with provided parameters
 * This function executes a single node in test mode and returns the results
 */
export const testNode = onCall({cors: true, region: 'us-central1'}, async (request) => {
    try {
        // Validate request
        if (!request.auth) {
            throw new HttpsError('unauthenticated', 'Unauthorized');
        }

        const { nodeId, nodeData, propsData } = request.data;

        if (!nodeId) {
            throw new HttpsError('invalid-argument', 'Missing required parameter: nodeId');
        }

        if (!propsData) {
            throw new HttpsError('invalid-argument', 'Missing required parameter: propsData');
        }

        // Check if the node exists in our available nodes
        const nodeSignature = availableNodes[nodeId];
        if (!nodeSignature) {
            throw new HttpsError('invalid-argument', `Node ${nodeId} is not available or testable`);
        }

        // Generate a unique execution ID for this test
        const executionId = uuidv4();
        const startTime = new Date();
        
        // Create a mock node object with test data
        const testNode = {
            ...nodeData,
            node_id: nodeId,
            propsData
        };

        try {
            // Create a mock WorkflowContext for testing the node
            const mockContext = {
                requestPayload: {
                    nodeId,
                    userId: request.auth.uid,
                    executionId,
                    isTest: true
                },
                run: async (name: string, fn: Function) => await fn(),
                cancel: () => {}
            } as unknown as WorkflowContext;

            // Execute the node
            const result = await nodeSignature.run(mockContext, testNode, null);
            
            const endTime = new Date();
            const durationMs = endTime.getTime() - startTime.getTime();
            
            return {
                success: true,
                executionId,
                duration: `${Math.round(durationMs / 1000)}s`,
                result,
                message: 'Node test completed successfully'
            };

        } catch (error) {
            const endTime = new Date();
            const durationMs = endTime.getTime() - startTime.getTime();
            
            console.error('Error testing node:', error);
            
            return {
                success: false,
                executionId,
                duration: `${Math.round(durationMs / 1000)}s`,
                error: error instanceof Error ? error.message : 'Unknown error',
                message: 'Node test failed'
            };
        }

    } catch (error) {
        console.error('Error in testNode:', error);
        throw new HttpsError('internal', `${error}`);
    }
});
