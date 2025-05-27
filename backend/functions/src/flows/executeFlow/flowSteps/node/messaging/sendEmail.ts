import { WorkflowContext } from "@upstash/workflow";
import { FlowNode } from "../../../type";
import { notifyUser } from "../../../../../helpers/emailNotifier";
import { processMentionsProps } from "../../../../../utils/processMentions";
import { generateAiFlowContext } from "../../../../../utils/generateAiFlowContext";

const sendEmail = async (context: WorkflowContext, step: FlowNode, previousStepResult: any) => {
    console.log('sendEmail', previousStepResult);

    // Process all string fields in propsData first
    const processedProps = processMentionsProps(step.propsData, previousStepResult);
    
    // Generate AI content for AI-enabled fields and get updated props
    const { processedPropsWithAiContext } = await generateAiFlowContext(step, processedProps);
    
    // Use the AI-updated props instead of just processed props
    const { subject, message, emailType, recipientEmail } = processedPropsWithAiContext;

    const emailMessage = {
        to: [{
            email: recipientEmail,
            name: recipientEmail // Using email as name if no name is provided
        }],
        from: {
            email: "noreply@goalmatic.io",
            name: "Goalmatic"
        },
        subject: subject,
        message_body: {
            type: emailType === 'html' ? "text/html" : "text/plain",
            value: message
        }
    };

    try {
        // Send the email
        const result = await notifyUser(emailMessage);
        console.log('Email sending result:', result);
        return { 
            success: result, 
            sentAt: new Date().toISOString(),  
            payload: processedPropsWithAiContext // Return updated props so subsequent nodes get processed values
        };
    } catch (error: any) {
        console.error('Error sending email:', error);
        return { success: false, error: error?.message || error };
    }
}

export const sendEmailNode = {
    nodeId: 'SEND_EMAIL',
    run: sendEmail
}