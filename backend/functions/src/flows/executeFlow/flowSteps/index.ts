import { WorkflowContext } from "@upstash/workflow";
import { availableNodes } from "./list";

// Define an interface for the expected structure of a step node's run method
// It now accepts an optional third argument for the previous step's result.
interface StepRunner {
    run: (context: WorkflowContext, stepData: any, previousStepResult?: any) => Promise<any>;
}

export const runStepsInContext = async (context: WorkflowContext, flowData: any) => {
        const { steps } = flowData;
        // Initialize a variable to hold the result of the previous step.
        // Upstash Workflow manages the state, so this variable will hold the correct
        // previous result during re-executions.
        let previousStepResult: any = undefined;

        // Use .entries() to get both the index and the step object
        for (const [index, step] of steps.entries()) {
            // Ensure the node exists before trying to run it
            const node: StepRunner = availableNodes[step.node_id];
            if (!node) {
                throw new Error(`Node with id ${step.node_id} not found.`);
            }

            // Wrap the execution of each step in context.run
            // Use a unique name for each step, e.g., combining index and node_id.
            // The result of the previous step ('previousStepResult') is passed to the current step's run method.
            previousStepResult = await context.run(`step-${index}-${step.node_id}`, () => {
                // Pass context, step data, and the result from the previous step
                return node.run(context, step, previousStepResult);
            });
        }

}