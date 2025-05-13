import { WorkflowContext } from "@upstash/workflow";
import { availableNodes } from "./list";

// Define an interface for the expected structure of a step node's run method
// It now accepts an optional third argument for the previous step's result.
interface StepRunner {
    run: (context: WorkflowContext, stepData: any, previousStepResult?: any) => Promise<any>;
}

export const runStepsInContext = async (context: WorkflowContext, flowData: any) => {
    const { steps } = flowData;

        let previousStepResult: any = {};


        for (const [index, step] of steps.entries()) {

            const node: StepRunner = availableNodes[step.node_id];
            if (!node) {
                throw new Error(`Node with id ${step.node_id} not found.`);
            }        
            previousStepResult[`step-${index}-${step.node_id}`] = await context.run(`step-${index}-${step.node_id}`, () => {
                return node.run(context, step, previousStepResult);
            });
        }

}