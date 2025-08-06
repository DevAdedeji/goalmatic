import { WorkflowContext } from "@upstash/workflow";
import { FlowNode } from "../../../type";

const scheduleIntervalTrigger = async (context: WorkflowContext, step: FlowNode, previousStepResult: any) => {
    try {
        // For schedule interval triggers, we need to get the trigger configuration from the flow
        const { flowId } = context.requestPayload as { flowId: string };
        
        // The trigger data should be available from the flow configuration
        // Since this is a scheduled execution, we construct the trigger data from the flow's trigger configuration
        const triggerData = step.propsData || {};
        
        // Get current execution time
        const now = new Date();
        const executedAt = now.toISOString();
        
        // Calculate next run time (this would typically be calculated based on the cron expression)
        // For now, we'll just provide the current execution time
        const nextRun = executedAt; // This should be calculated based on cron expression in a real implementation
        
        // Return the schedule data in a structured format for subsequent nodes
        return {
            success: true,
            payload: {
                // Schedule configuration
                interval: triggerData.Input || 'Not specified',
                interval_type: 'cron',
                start_date: triggerData.createdAt || executedAt,
                end_date: null, // Intervals typically don't have end dates unless specified
                next_run: nextRun,
                
                // Execution metadata
                execution_time: executedAt,
                trigger_type: 'SCHEDULE_INTERVAL',
                flow_id: flowId,
                cron_expression: triggerData.cron || '* * * * *'
            }
        };
    } catch (error: any) {
        console.error('Error processing schedule interval trigger:', error);
        return {
            success: false,
            error: error?.message || 'Failed to process schedule interval trigger'
        };
    }
};

export const scheduleIntervalTriggerNode = {
    nodeId: 'SCHEDULE_INTERVAL',
    run: scheduleIntervalTrigger
};
