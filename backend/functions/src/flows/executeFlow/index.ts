import { onRequest } from "firebase-functions/v2/https";
import { Client } from "@upstash/qstash";
import { WorkflowContext } from "@upstash/workflow";
import { serve } from "@upstash/workflow/express";
import { verifyExecuteFlowData } from "./utils";
import { goals_db, is_dev } from "../../init";
import { runStepsInContext } from "./flowSteps";
import { Timestamp } from "firebase-admin/firestore";
import { getAnalytics } from "../../utils/analytics";
import { notifyUserOnFlowFailure } from "../../helpers/flowFailureNotifier";

const UPSTASH_QSTASH_TOKEN = process.env.UPSTASH_QSTASH_TOKEN || process.env.QSTASH_TOKEN;
const API_BASE_URL = is_dev
  ? `${process.env.BASE_URL_DEV}/executeFlow`
  : `${process.env.BASE_URL}/executeFlow`;


  
const runWorkflow = async (context: WorkflowContext) => {
  const startTime = new Date();
  let logRef: FirebaseFirestore.DocumentReference | null = null;
  const analytics = getAnalytics();

  try {
    // Validate request payload early to avoid uncaught destructuring errors
    const payload = context.requestPayload as {
      flowId: string;
      userId: string;
      executionId: string;
      triggerData?: any;
    } | undefined;

    if (!payload || !payload.flowId || !payload.userId || !payload.executionId) {
      // Cancel the workflow gracefully if payload is invalid or missing
      context.cancel();
      return { isValid: false, error: "Invalid or missing request payload" };
    }

    const { flowId, userId, executionId, triggerData } = payload;

    // Track flow execution start
    analytics.trackFlowEvent('EXECUTION_STARTED', flowId, {
      execution_id: executionId,
      trigger_type: triggerData?.trigger_type || 'manual',
      has_trigger_data: !!triggerData
    }, userId);

    // Create initial log entry
    logRef = goals_db
      .collection("flows")
      .doc(flowId)
      .collection("logs")
      .doc(executionId);
    await logRef.set({
      id: executionId,
      status: "running",
      start_time: Timestamp.fromDate(startTime),
      trigger: "workflow",
      steps_completed: 0,
      steps_total: 0,
      created_at: Timestamp.fromDate(startTime),
      creator_id: userId,
    });

    const { flowData, isValid } = await context.run("verifyData", async () => {
      const { isValid, error, flowData } = await verifyExecuteFlowData(
        flowId,
        userId,
        executionId,
      );
      if (!isValid) {
        context.cancel();
        return { isValid, error };
      }
      return { isValid, flowData };
    });

    if (!flowData) {
      context.cancel();
      // Update log with failure
      if (logRef) {
        await logRef.update({
          status: "failed",
          error: "Flow data is undefined",
          end_time: Timestamp.fromDate(new Date()),
        });
      }
      // Proactively notify the user that execution failed before steps started
      try {
        const payload = context.requestPayload as { flowId: string; userId: string; executionId: string } | undefined;
        if (payload?.userId && payload?.flowId) {
          // Try fetch flow name
          let flowName: string | undefined = undefined;
          try {
            const flowDoc = await goals_db.collection("flows").doc(payload.flowId).get();
            flowName = flowDoc.exists ? (flowDoc.data()?.name as string | undefined) : undefined;
          } catch {}
          await notifyUserOnFlowFailure({
            userId: payload.userId,
            flowId: payload.flowId,
            executionId: payload.executionId,
            errorMessage: 'Flow data is undefined',
            flowName,
          });
        }
      } catch (notifyErr) {
        console.error('Failed to notify user on flow failure (no flowData):', notifyErr);
      }
      return { isValid: false, error: "Flow data is undefined" };
    }

    if (isValid) {
      // Update log with total steps
      await logRef.update({
        steps_total: flowData.steps?.length || 0,
      });

      // Pass trigger data to steps if available (e.g., from email trigger)
      await runStepsInContext(context, flowData, triggerData);

      // Update log with success
      const endTime = new Date();
      const durationMs = endTime.getTime() - startTime.getTime();
      const durationStr = `${Math.round(durationMs / 1000)}s`;

      await logRef.update({
        status: "completed",
        end_time: Timestamp.fromDate(endTime),
        duration: durationStr,
        steps_completed: flowData.steps?.length || 0,
      });
    }

    if (flowData.trigger.node_id === "SCHEDULE_TIME") {
      await goals_db.collection("flows").doc(flowData.id).update({
        status: 0,
        schedule: null,
      });
    }
  } catch (error) {
    // Detect Upstash's expected WorkflowAbort to avoid noisy logs and failure marking
    const isWorkflowAbort =
      (typeof (error as any)?.name === 'string' && (error as any).name === 'WorkflowAbort') ||
      String(error).includes('WorkflowAbort');

    if (!isWorkflowAbort) {
      console.error("Error in runWorkflow:", error);
    }

    if (!isWorkflowAbort) {
      // Update log with failure only for real errors
      if (logRef) {
        const endTime = new Date();
        const durationMs = endTime.getTime() - startTime.getTime();
        const durationStr = `${Math.round(durationMs / 1000)}s`;

        await logRef.update({
          status: "failed",
          error: error instanceof Error ? error.message : "Unknown error",
          end_time: Timestamp.fromDate(endTime),
          duration: durationStr,
        });
      }

      try {
        const payload = context.requestPayload as { flowId: string; userId: string; executionId: string } | undefined;
        if (payload?.userId && payload?.flowId) {
          // Try fetch flow name
          let flowName: string | undefined = undefined;
          try {
            const flowDoc = await goals_db.collection("flows").doc(payload.flowId).get();
            flowName = flowDoc.exists ? (flowDoc.data()?.name as string | undefined) : undefined;
          } catch {}

          const nodeName = (error as any)?.nodeName as string | undefined;

          await notifyUserOnFlowFailure({
            userId: payload.userId,
            flowId: payload.flowId,
            executionId: payload.executionId,
            errorMessage: error instanceof Error ? error.message : String(error),
            flowName,
            nodeName,
          });
        }
      } catch (notifyErr) {
        console.error('Failed to notify user on flow failure:', notifyErr);
      }
    }

    // Re-throw the error so it can be handled by the workflow system
    throw error;
  }
};

// Export the Firebase Cloud Function, passing requests to the workflow handler
export const executeFlow = onRequest(
  { cors: true, region: "us-central1", timeoutSeconds: 540},
  (() => {
    const options: any = { url: API_BASE_URL };
    if (UPSTASH_QSTASH_TOKEN) {
      options.qstashClient = new Client({ token: UPSTASH_QSTASH_TOKEN });
    }

    // The Upstash serve() returns an Express router-like handler that expects (req, res, next).
    // Firebase onRequest invokes handlers as (req, res). Wrap to provide a no-op next callback.
    const routerLike = serve(runWorkflow, options) as any;
    return (req: any, res: any) => {
      if (req.method !== 'POST') {
        res.status(405).send('Only POST requests are allowed in workflows');
        return;
      }
      routerLike(req, res, () => {});
    };
  })()
);
