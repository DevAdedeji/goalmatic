import { EnhancedWorkflowContext } from "../../../context";
import { FlowNode } from "../../../type";
import { notifyUser } from "../../../../../helpers/emailNotifier";

const sendEmail = async (context: EnhancedWorkflowContext, step: FlowNode, previousStepResult: any) => {
    // Access all previous node results
    const allPreviousResults = context.getAllPreviousResults();

    console.log('allPreviousResults- sendEmail', allPreviousResults);
    console.log('context', context);
    // Extract email data from the step's props
    const { subject, body, emailType, recipientEmail } = step.propsData;

    // Prepare the email message
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
            value: body
        }
    };

    try {
        // Send the email
        const result = await notifyUser(emailMessage);
        return { success: result, sentAt: new Date().toISOString(), context: { previousResults: allPreviousResults } };
    } catch (error: any) {
        return { success: false, error: error?.message || error, context: { previousResults: allPreviousResults } };
    }
}

export const sendEmailNode = {
    nodeId: 'SEND_EMAIL',
    run: sendEmail
}