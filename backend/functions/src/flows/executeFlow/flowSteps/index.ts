import { WorkflowContext } from "@upstash/workflow";
import { availableNodes } from "./list";
import { goals_db } from "../../../init";
import { Timestamp } from "firebase-admin/firestore";

// Define an interface for the expected structure of a step node's run method
// Some triggers (like email) don't need previousStepResult, others (like schedule) might.
interface StepRunner {
  run: (
    context: WorkflowContext,
    stepData: any,
    previousStepResult?: any,
  ) => Promise<any>;
}

export const runStepsInContext = async (
  context: WorkflowContext,
  flowData: any,
  triggerData?: any,
) => {
  const { steps } = flowData;

  let previousStepResult: any = {};
  const payload = context.requestPayload as { flowId: string; userId: string; executionId: string } | undefined;
  const flowId = payload?.flowId;
  const executionId = payload?.executionId;
  const stepsCollectionRef = flowId && executionId
    ? goals_db.collection('flows').doc(flowId).collection('logs').doc(executionId).collection('steps')
    : null;

  const safeStringify = (obj: any, maxLen = 2000): string => {
    try {
      const str = JSON.stringify(obj, (_key, value) => {
        if (typeof value === 'string' && value.length > 500) return `${value.slice(0, 500)}...`;
        if (Array.isArray(value) && value.length > 50) return `[Array(${value.length})]`;
        return value;
      });
      return str.length > maxLen ? `${str.slice(0, maxLen)}...` : str;
    } catch {
      return '[unserializable]';
    }
  };


  // Always run the trigger node if it exists (whether we have external data or not)
  if (flowData.trigger) {
    // For schedule triggers or other triggers without external data, run the trigger node
    const triggerNodeId = flowData.trigger.node_id;
    const triggerNode: StepRunner = availableNodes[triggerNodeId];

    if (triggerNode) {
      const start = new Date();
      const stepDocId = `trigger-${triggerNodeId}`;
      if (stepsCollectionRef) {
        await stepsCollectionRef.doc(stepDocId).set({
          index: -1,
          node_id: triggerNodeId,
          name: flowData.trigger?.name || 'Trigger',
          status: 'running',
          started_at: Timestamp.fromDate(start),
          type: 'trigger',
        });
      }

      // Execute trigger based on its type
      const triggerResult = await context.run(
        `trigger-${triggerNodeId}`,
        () => {
          // Triggers that get data from workflow context (email, schedule)
          if (triggerNodeId === 'EMAIL_TRIGGER' || triggerNodeId === 'SCHEDULE_INTERVAL' || triggerNodeId === 'SCHEDULE_TIME') {
            return triggerNode.run(context, flowData.trigger);
          } else {
            // Other triggers may need previousStepResult for configuration
            return triggerNode.run(context, flowData.trigger, previousStepResult);
          }
        }
      );

      // Make trigger result available for subsequent nodes
      previousStepResult[`trigger-${triggerNodeId}`] = triggerResult;

      const end = new Date();
      if (stepsCollectionRef) {
        await stepsCollectionRef.doc(stepDocId).update({
          status: triggerResult?.success === false ? 'failed' : 'completed',
          success: triggerResult?.success !== false,
          ended_at: Timestamp.fromDate(end),
          duration: `${Math.round((end.getTime() - start.getTime()) / 1000)}s`,
          result_summary: safeStringify(triggerResult),
        });
      }

      if (triggerResult?.success === false) {
        const err: any = new Error(triggerResult?.error || `Trigger ${triggerNodeId} failed`);
        err.nodeId = triggerNodeId;
        err.nodeName = flowData.trigger?.name || 'Trigger';
        throw err;
      }
    }
  }

  for (const [index, step] of steps.entries()) {
    const node: StepRunner = availableNodes[step.node_id];
    if (!node) {
      throw new Error(`Node with id ${step.node_id} not found.`);
    }
    const start = new Date();
    const stepDocId = `step-${index}-${step.node_id}`;
    if (stepsCollectionRef) {
      await stepsCollectionRef.doc(stepDocId).set({
        index,
        node_id: step.node_id,
        name: step.name || step.node_id,
        status: 'running',
        started_at: Timestamp.fromDate(start),
        type: 'action',
      });
    }

    const stepResult = await context.run(
      `step-${index}-${step.node_id}`,
      () => {
        return node.run(context, step, previousStepResult);
      },
    );
    previousStepResult[`step-${index}-${step.node_id}`] = stepResult;

    const end = new Date();
    if (stepsCollectionRef) {
      await stepsCollectionRef.doc(stepDocId).update({
        status: stepResult?.success === false ? 'failed' : 'completed',
        success: stepResult?.success !== false,
        ended_at: Timestamp.fromDate(end),
        duration: `${Math.round((end.getTime() - start.getTime()) / 1000)}s`,
        result_summary: safeStringify(stepResult),
        error: stepResult?.success === false ? (stepResult?.error || null) : null,
      });
    }

    if (flowId && executionId) {
      await goals_db
        .collection('flows')
        .doc(flowId)
        .collection('logs')
        .doc(executionId)
        .update({ steps_completed: index + 1 });
    }

    if (stepResult?.success === false) {
      const err: any = new Error(stepResult?.error || `Step ${index} (${step.node_id}) failed`);
      err.nodeId = step.node_id;
      err.nodeName = step.name || step.node_id;
      err.stepIndex = index;
      throw err;
    }
  }
};
