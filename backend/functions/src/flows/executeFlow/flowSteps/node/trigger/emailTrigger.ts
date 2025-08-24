import { WorkflowContext } from "@upstash/workflow";
import { FlowNode } from "../../../type";

const emailTrigger = async (context: WorkflowContext, step: FlowNode, previousStepResult: any) => {
    try {
        // Extract email trigger data from previousStepResult
        let triggerData = previousStepResult?.["trigger-data"];

        // If no trigger data is available (e.g., during testing), provide sample data
        if (!triggerData) {
            console.log('No email trigger data found, using sample data for testing');
            triggerData = {
                from_email: 'test@example.com',
                from_name: 'Test User',
                to_email: step?.propsData?.email || 'test-trigger@goalmatic.io',
                subject: '[TEST] Sample Email for Testing',
                body_text: 'This is a sample email body for testing purposes. You can use this data to build and test your email-triggered workflows.',
                body_html: '<p>This is a <strong>sample email body</strong> for testing purposes.</p><p>You can use this data to build and test your email-triggered workflows.</p>',
                received_at: new Date().toISOString(),
                message_id: 'test-message-' + Date.now(),
                trigger_email: step?.propsData?.email || 'test-trigger@goalmatic.io',
                account_id: 'test-account',
                attachments: [
                    {
                        filename: 'sample-document.pdf',
                        content_type: 'application/pdf',
                        size_bytes: 1024000,
                        download_url: 'https://example.com/sample.pdf'
                    }
                ],
                headers: {
                    'content-type': 'text/plain; charset=UTF-8',
                    'x-mailer': 'Test Email Client',
                    'user-agent': 'Test/1.0'
                },
                raw_payload: {
                    messageId: 'test-message-' + Date.now(),
                    subject: '[TEST] Sample Email for Testing',
                    fromAddress: 'test@example.com',
                    fromName: 'Test User',
                    toAddress: [step?.propsData?.email || 'test-trigger@goalmatic.io'],
                    date: new Date().toISOString(),
                    hasAttachment: true,
                    attachments: [{
                        fileName: 'sample-document.pdf',
                        size: 1024000,
                        contentType: 'application/pdf'
                    }],
                    preview: 'This is a sample email body for testing purposes.',
                    accountId: 'test-account'
                },
                trigger_type: 'email'
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
                received_date: triggerData.received_at,

                // Additional fields for complete email access
                has_attachments: (triggerData.attachments && triggerData.attachments.length > 0) || false,
                raw_payload: triggerData.raw_payload || {}, // Full webhook payload if available
                trigger_type: triggerData.trigger_type || 'email'
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
