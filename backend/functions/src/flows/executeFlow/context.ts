import { WorkflowContext } from "@upstash/workflow";

export interface EnhancedWorkflowContext extends WorkflowContext {
    nodeResults: Record<string, any>;
    getNodeResult: (nodeId: string) => any;
    getAllPreviousResults: () => Record<string, any>;
}

export class FlowContextManager {
    private nodeResults: Record<string, any> = {};
    private executionOrder: string[] = [];

    constructor(private baseContext: WorkflowContext) {}

    setNodeResult(nodeId: string, result: any) {
        this.nodeResults[nodeId] = result;
        this.executionOrder.push(nodeId);
    }

    getNodeResult(nodeId: string): any {
        return this.nodeResults[nodeId];
    }

    getAllPreviousResults(): Record<string, any> {
        return { ...this.nodeResults };
    }

    createEnhancedContext(): EnhancedWorkflowContext {
        // Create a new object with the baseContext as prototype
        const enhanced: any = Object.create(this.baseContext);
        enhanced.nodeResults = this.nodeResults;
        enhanced.getNodeResult = this.getNodeResult.bind(this);
        enhanced.getAllPreviousResults = this.getAllPreviousResults.bind(this);
        return enhanced as EnhancedWorkflowContext;
    }
} 