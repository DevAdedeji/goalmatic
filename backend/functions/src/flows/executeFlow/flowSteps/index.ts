import { WorkflowContext } from "@upstash/workflow";
import { availableNodes } from "./list";
import { goals_db } from "../../../init";
import { Timestamp } from "firebase-admin/firestore";

// Define an interface for the expected structure of a step node's run method
// It now accepts an optional third argument for the previous step's result.
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

  // Handle trigger data - either from external trigger (email) or generate for schedule triggers
  if (triggerData) {
    // External trigger data (e.g., from email trigger)
    previousStepResult["trigger-data"] = triggerData;

    // Also make trigger data available in the format expected by the frontend mention system
    // For email triggers, structure the data to match the frontend expectations
    if (flowData.trigger?.node_id === 'EMAIL_TRIGGER') {
      previousStepResult["trigger-EMAIL_TRIGGER"] = {
        payload: {
          from_email: triggerData.from_email,
          from_name: triggerData.from_name,
          to_email: triggerData.to_email,
          subject: triggerData.subject,
          body_text: triggerData.body_text,
          body_html: triggerData.body_html,
          received_at: triggerData.received_at,
          message_id: triggerData.message_id,
          trigger_email: triggerData.trigger_email,
          account_id: triggerData.account_id,
          attachments: triggerData.attachments || [],
          headers: triggerData.headers || {},
          sender: triggerData.from_email,
          sender_name: triggerData.from_name || triggerData.from_email,
          email_subject: triggerData.subject,
          email_body: triggerData.body_text || triggerData.body_html,
          received_date: triggerData.received_at
        }
      };
    }
  } else if (flowData.trigger) {
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

      const triggerResult = await context.run(
        `trigger-${triggerNodeId}`,
        () => {
          return triggerNode.run(context, flowData.trigger, previousStepResult);
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
