import { WorkflowContext } from "@upstash/workflow";
import { availableNodes } from "./list";
import { FlowContextManager, EnhancedWorkflowContext } from "../context";

// Define an interface for the expected structure of a step node's run method
// It now accepts an optional third argument for the previous step's result.
interface StepRunner {
    run: (context: EnhancedWorkflowContext, stepData: any, previousStepResult?: any) => Promise<any>;
}

export const runStepsInContext = async (context: WorkflowContext, flowData: any) => {
    const { steps } = flowData;
    
    // Create our context manager
    const contextManager = new FlowContextManager(context);
    const enhancedContext = contextManager.createEnhancedContext();
    

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

            // Execute the node within context.run
            previousStepResult = await context.run(`step-${index}-${step.node_id}`, async () => {
                // Execute the node with our enhanced context
                const result = await node.run(enhancedContext, step, previousStepResult);
                
                // Store the result in our context manager
                contextManager.setNodeResult(step.node_id, result);
                
                return result;
            });
        }

}