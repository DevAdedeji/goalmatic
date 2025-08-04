import { WorkflowContext } from "@upstash/workflow";
import { FlowNode } from "../../../type";

const emailTrigger = async (context: WorkflowContext, step: FlowNode, previousStepResult: any) => {
    try {
        // Extract email trigger data from previousStepResult
        const triggerData = previousStepResult?.["trigger-data"];
        
        if (!triggerData) {
            return {
                success: false,
                error: 'No email trigger data found'
            };
        }

        // Return the email data in a structured format for subsequent nodes
        return {
            success: true,
            payload: {
                // Email metadata
                from_email: triggerData.from_email,
                from_name: triggerData.from_name,
                to_email: triggerData.to_email,
                subject: triggerData.subject,
                body_text: triggerData.body_text,
                body_html: triggerData.body_html,
                received_at: triggerData.received_at,
                message_id: triggerData.message_id,
                
                // Processing info
                trigger_email: triggerData.trigger_email,
                account_id: triggerData.account_id,
                
                // Attachments (if any)
                attachments: triggerData.attachments || [],
                
                // Additional headers
                headers: triggerData.headers || {},
                
                // Convenience fields for easy access
                sender: triggerData.from_email,
                sender_name: triggerData.from_name || triggerData.from_email,
                email_subject: triggerData.subject,
                email_body: triggerData.body_text || triggerData.body_html,
                received_date: triggerData.received_at
            }
        };
    } catch (error: any) {
        console.error('Error processing email trigger:', error);
        return {
            success: false,
            error: error?.message || 'Failed to process email trigger'
        };
    }
};

export const emailTriggerNode = {
    nodeId: 'EMAIL_TRIGGER',
    run: emailTrigger
};
