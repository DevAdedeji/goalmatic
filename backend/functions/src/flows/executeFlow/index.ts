import { onRequest } from 'firebase-functions/v2/https';
import { Client } from "@upstash/qstash";
import { WorkflowContext } from "@upstash/workflow";
import { serve } from "@upstash/workflow/express";
import { verifyExecuteFlowData } from './utils';
import { goals_db, is_dev } from '../../init';
import { runStepsInContext } from './flowSteps';
import { FlowContextManager } from './context';

const UPSTASH_QSTASH_TOKEN = process.env.UPSTASH_QSTASH_TOKEN;
const API_BASE_URL = is_dev ? `${process.env.BASE_URL_DEV}/executeFlow` : `${process.env.BASE_URL}/executeFlow`;

const runWorkflow = async (context: WorkflowContext) => {
    const { flowId, userId, executionId } = context.requestPayload as { flowId: string, userId: string, executionId: string };

    // Create enhanced context
    const contextManager = new FlowContextManager(context);
    const enhancedContext = contextManager.createEnhancedContext();

    const { flowData, isValid } = await enhancedContext.run('verifyData', async () => {
        const { isValid, error, flowData } = await verifyExecuteFlowData(flowId, userId, executionId);
        if (!isValid) {
            enhancedContext.cancel();
            return { isValid, error };
        }
        return { isValid, flowData };
    });

    if (!flowData) {
        enhancedContext.cancel();
        return { isValid: false, error: 'Flow data is undefined' };
    }

    if (isValid) {
        await runStepsInContext(enhancedContext, flowData);
    }

    if (flowData.trigger.node_id === 'SCHEDULE_TIME') {
        await enhancedContext.run('updateFlowStatus', async () => {
            await goals_db.collection('flows').doc(flowData.id).update({
                status: 0,
                schedule: null
            });
        });
    }
};

export const executeFlow = onRequest(
    { cors: true, region: 'us-central1' }, 
    serve(runWorkflow, { 
        qstashClient: new Client({ token: UPSTASH_QSTASH_TOKEN }), 
        url: API_BASE_URL,
        retries: 3
    }) as any
);






