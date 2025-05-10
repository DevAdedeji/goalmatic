import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { goals_db } from '../../init';
import { v4 as uuidv4 } from 'uuid';
import { Timestamp } from 'firebase-admin/firestore';
import { runStepsInContext } from '../executeFlow/flowSteps';
import { WorkflowContext } from '@upstash/workflow';

/**
 * Test a flow without activating it
 * This function executes a flow's steps in test mode and records the results
 * but does not change the flow's status or schedule it
 */
export const testFlow = onCall({cors: true, region: 'us-central1'}, async (request) => {
    try {
        // Validate request
        if (!request.auth) {
            throw new HttpsError('unauthenticated', 'Unauthorized');
        }

        const { flowId } = request.data;

        if (!flowId) {
            throw new HttpsError('invalid-argument', 'Missing required parameter: flowId');
        }

        // Get the flow data
        const flowDoc = await goals_db.collection('flows').doc(flowId).get();
        
        if (!flowDoc.exists) {
            throw new HttpsError('not-found', 'Flow not found');
        }

        const flowData = flowDoc.data();

        // Verify that the flow belongs to the user making the request
        if (flowData?.creator_id !== request.auth.uid) {
            throw new HttpsError('permission-denied', 'You do not have permission to test this flow');
        }

        // Check if the flow has a trigger
        // if (!flowData?.trigger) {
        //     throw new HttpsError('failed-precondition', 'Flow must have a trigger to be tested');
        // }
        
        // Check if the flow has steps
        if (!flowData?.steps || flowData.steps.length === 0) {
            throw new HttpsError('failed-precondition', 'Flow must have at least one step to be tested');
        }

        // Generate a unique execution ID for this test run
        const executionId = uuidv4();
        const startTime = new Date();
        
        // Create a run record for this test execution
        const runRef = goals_db.collection('flows').doc(flowId).collection('runs').doc(executionId);
        await runRef.set({
            id: executionId,
            status: 'running',
            start_time: Timestamp.fromDate(startTime),
            trigger: 'test',
            steps_completed: 0,
            steps_total: flowData.steps.length,
            created_at: Timestamp.fromDate(startTime),
            creator_id: request.auth.uid
        });

        try {
            // Create a mock WorkflowContext for running the steps
            const context = {
                requestPayload: {
                    flowId,
                    userId: request.auth.uid,
                    executionId
                },
                run: async (name, fn) => await fn(),
                cancel: () => {}
            } as unknown as WorkflowContext;

            // Execute the flow steps
            await runStepsInContext(context, flowData);
            
            // Update the run record with success status
            const endTime = new Date();
            const durationMs = endTime.getTime() - startTime.getTime();
            const durationStr = `${Math.round(durationMs / 1000)}s`;
            
            await runRef.update({
                status: 'completed',
                end_time: Timestamp.fromDate(endTime),
                duration: durationStr,
                steps_completed: flowData.steps.length
            });

            return {
                success: true,
                executionId,
                message: 'Flow test completed successfully'
            };
        } catch (error) {
            // Update the run record with error status
            const endTime = new Date();
            const durationMs = endTime.getTime() - startTime.getTime();
            const durationStr = `${Math.round(durationMs / 1000)}s`;
            
            await runRef.update({
                status: 'failed',
                end_time: Timestamp.fromDate(endTime),
                duration: durationStr,
                error: error instanceof Error ? error.message : String(error)
            });

            throw new HttpsError('internal', `Error executing flow: ${error}`);
        }
    } catch (error) {
        console.error('Error in testFlow:', error);
        throw new HttpsError('internal', `${error}`);
    }
});
