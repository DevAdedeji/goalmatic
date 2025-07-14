import { onRequest } from 'firebase-functions/v2/https';
import { Client } from "@upstash/qstash";
import { WorkflowContext } from "@upstash/workflow";
import { serve } from "@upstash/workflow/express";
import { verifyExecuteFlowData } from './utils';
import { goals_db, is_dev } from '../../init';
import { runStepsInContext } from './flowSteps';
import { Timestamp } from 'firebase-admin/firestore';



const UPSTASH_QSTASH_TOKEN = process.env.UPSTASH_QSTASH_TOKEN;
const API_BASE_URL = is_dev ? `${process.env.BASE_URL_DEV}/executeFlow` : `${process.env.BASE_URL}/executeFlow`;





const runWorkflow = async (context: WorkflowContext) => {


    const { flowId, userId, executionId } = context.requestPayload as { flowId: string, userId: string, executionId: string }

    const startTime = new Date();
    let logRef: FirebaseFirestore.DocumentReference | null = null;

    try {
        // Create initial log entry
        logRef = goals_db.collection('flows').doc(flowId).collection('logs').doc(executionId);
        await logRef.set({
            id: executionId,
            status: 'running',
            start_time: Timestamp.fromDate(startTime),
            trigger: 'workflow',
            steps_completed: 0,
            steps_total: 0,
            created_at: Timestamp.fromDate(startTime),
            creator_id: userId
        });

        const { flowData, isValid } = await context.run('verifyData', async () => {
            const { isValid, error, flowData } = await verifyExecuteFlowData(flowId, userId, executionId)
            if (!isValid) {
                context.cancel()
                return { isValid, error }
            }
            return { isValid, flowData }
        })

        if (!flowData) {
            context.cancel()
            // Update log with failure
            if (logRef) {
                await logRef.update({
                    status: 'failed',
                    error: 'Flow data is undefined',
                    end_time: Timestamp.fromDate(new Date())
                });
            }
            return { isValid: false, error: 'Flow data is undefined' }
        }

        if (isValid) {
            // Update log with total steps
            await logRef.update({
                steps_total: flowData.steps?.length || 0
            });

            await runStepsInContext(context, flowData)

            // Update log with success
            const endTime = new Date();
            const durationMs = endTime.getTime() - startTime.getTime();
            const durationStr = `${Math.round(durationMs / 1000)}s`;
            
            await logRef.update({
                status: 'completed',
                end_time: Timestamp.fromDate(endTime),
                duration: durationStr,
                steps_completed: flowData.steps?.length || 0
            });
        }

        if (flowData.trigger.node_id === 'SCHEDULE_TIME') {
            await goals_db.collection('flows').doc(flowData.id).update({
                status: 0,
                schedule: null
            });
        }
    } catch (error) {
        console.error('Error in runWorkflow:', error);
        
        // Update log with failure
        if (logRef) {
            const endTime = new Date();
            const durationMs = endTime.getTime() - startTime.getTime();
            const durationStr = `${Math.round(durationMs / 1000)}s`;
            
            await logRef.update({
                status: 'failed',
                error: error instanceof Error ? error.message : 'Unknown error',
                end_time: Timestamp.fromDate(endTime),
                duration: durationStr
            });
        }
        
        // Re-throw the error so it can be handled by the workflow system
        throw error;
    }

}


// Export the Firebase Cloud Function, passing requests to the workflow handler
export const executeFlow = onRequest({ cors: true, region: 'us-central1' }, serve(runWorkflow, { qstashClient: new Client({ token: UPSTASH_QSTASH_TOKEN }), url: API_BASE_URL }) as any)






