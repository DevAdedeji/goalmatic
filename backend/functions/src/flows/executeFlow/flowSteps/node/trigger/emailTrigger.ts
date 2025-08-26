import { WorkflowContext } from "@upstash/workflow";
import { FlowNode } from "../../../type";

const emailTrigger = async (context: WorkflowContext, step: FlowNode) => {
    try {
        // Get trigger data from workflow context (like scheduled triggers)
        const { triggerData } = context.requestPayload as { triggerData?: any };

        // Get flow configuration from step
        const { propsData } = step;

        // If no external trigger data, use flow configuration for testing
        if (!triggerData) {
            console.log('No external email trigger data found, using flow configuration for testing');

            return {
                success: true,
                payload: {
                    from_email: 'test@example.com',
                    from_name: 'Test User',
                    to_email: propsData?.email || 'test-trigger@goalmatic.io',
                    subject: '[TEST] Sample Email for Testing',
                    body_text: 'This is a sample email body for testing purposes.',
                    body_html: null,
                    received_at: new Date().toISOString(),
                    message_id: 'test-message-' + Date.now(),
                    headers: {},
                    attachments: [],
                    trigger_email: propsData?.email || 'test-trigger@goalmatic.io',
                    account_id: null,
                    raw_payload: null,
                    trigger_type: 'email',
                    processed_at: new Date().toISOString()
                }
            };
        }

        // Process real email trigger data - keep it simple and consistent
        return {
            success: true,
            payload: {
                // Core email data
                from_email: triggerData.from_email || triggerData.fromAddress,
                from_name: triggerData.from_name || triggerData.fromName,
                to_email: triggerData.to_email || triggerData.toAddress,
                subject: triggerData.subject,
                body_text: triggerData.body_text || triggerData.bodyText || triggerData.preview,
                body_html: triggerData.body_html || triggerData.bodyHtml,
                received_at: triggerData.received_at || triggerData.date,
                message_id: triggerData.message_id || triggerData.messageId,

                // Processing info
                trigger_email: triggerData.trigger_email || triggerData.toAddress,
                account_id: triggerData.account_id || triggerData.accountId,

                // Optional data
                headers: triggerData.headers || {},
                attachments: triggerData.attachments || [],

                // Raw payload for complete access
                raw_payload: triggerData.raw_payload || triggerData,

                // Metadata
                trigger_type: 'email',
                processed_at: new Date().toISOString()
            }
        };
    } catch (error: any) {
        console.error('Error processing email trigger:', error);

        // Let workflow system handle the error properly
        throw error;
    }
};

export const emailTriggerNode = {
    nodeId: 'EMAIL_TRIGGER',
    run: emailTrigger
};
