import { WorkflowContext } from "@upstash/workflow";
import { availableNodes } from "./list";

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

  // If we have trigger data (e.g., from email trigger), include it in the initial step result
  if (triggerData) {
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
  }

  for (const [index, step] of steps.entries()) {
    const node: StepRunner = availableNodes[step.node_id];
    if (!node) {
      throw new Error(`Node with id ${step.node_id} not found.`);
    }
    previousStepResult[`step-${index}-${step.node_id}`] = await context.run(
      `step-${index}-${step.node_id}`,
      () => {
        return node.run(context, step, previousStepResult);
      },
    );
  }
};
