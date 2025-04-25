import { onRequest } from 'firebase-functions/v2/https';
import { Client } from "@upstash/qstash";
import { WorkflowContext } from "@upstash/workflow";
import { serve } from "@upstash/workflow/express";
import { verifyExecuteFlowData } from './utils';
import { goals_db, is_dev } from '../../init';
import { runStepsInContext } from './flowSteps';



const UPSTASH_QSTASH_TOKEN = process.env.UPSTASH_QSTASH_TOKEN;
const API_BASE_URL = is_dev ? `${process.env.BASE_URL_DEV}/executeFlow` : `${process.env.BASE_URL}/executeFlow`;





const runWorkflow = async (context: WorkflowContext) => {


    const { flowId, userId, executionId } = context.requestPayload as { flowId: string, userId: string, executionId: string }

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
        return { isValid: false, error: 'Flow data is undefined' }
    }

    if (isValid) {
        await runStepsInContext(context, flowData)
    }

    if (flowData.trigger.node_id === 'SCHEDULE_TIME') {
        await goals_db.collection('flows').doc(flowData.id).update({
            status: 0,
            schedule: null
        });
    }

}


// Export the Firebase Cloud Function, passing requests to the workflow handler
export const executeFlow = onRequest({ cors: true, region: 'us-central1' }, serve(runWorkflow, { qstashClient: new Client({ token: UPSTASH_QSTASH_TOKEN }), url: API_BASE_URL }) as any)






