import { WorkflowContext } from "@upstash/workflow";
import { FlowNode } from "../../../type";
import { notifyUser } from "../../../../../helpers/emailNotifier";

const sendEmail = async (context: WorkflowContext, step: FlowNode, previousStepResult: any) => {
    console.log('previousStepResult', previousStepResult);
    console.log(step.name, step.propsData);

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
        console.log('Email sending result:', result);
        return { success: result, sentAt: new Date().toISOString() };
    } catch (error: any) {
        console.error('Error sending email:', error);
        return { success: false, error: error?.message || error };
    }
}

export const sendEmailNode = {
    nodeId: 'SEND_EMAIL',
    run: sendEmail
}