import { WorkflowContext } from "@upstash/workflow";
import { FlowNode } from "../../../type";

const scheduleTimeTrigger = async (context: WorkflowContext, step: FlowNode, previousStepResult: any) => {
    try {
        // For schedule time triggers, we need to get the trigger configuration from the flow
        const { flowId } = context.requestPayload as { flowId: string };
        
        // The trigger data should be available from the flow configuration
        // Since this is a scheduled execution, we construct the trigger data from the flow's trigger configuration
        const triggerData = step.propsData || {};
        
        // Get current execution time
        const now = new Date();
        const scheduledAt = now.toISOString();
        
        // Return the schedule data in a structured format for subsequent nodes
        return {
            success: true,
            payload: {
                // Schedule configuration
                date: triggerData.date || now.toISOString().split('T')[0],
                time: triggerData.time || now.toTimeString().split(' ')[0].substring(0, 5),
                timezone: triggerData.timezone || 'UTC',
                scheduled_at: scheduledAt,
                
                // Execution metadata
                execution_time: scheduledAt,
                trigger_type: 'SCHEDULE_TIME',
                flow_id: flowId
            }
        };
    } catch (error: any) {
        console.error('Error processing schedule time trigger:', error);
        return {
            success: false,
            error: error?.message || 'Failed to process schedule time trigger'
        };
    }
};

export const scheduleTimeTriggerNode = {
    nodeId: 'SCHEDULE_TIME',
    run: scheduleTimeTrigger
};
