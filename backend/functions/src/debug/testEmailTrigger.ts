import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { goals_db } from '../init';

/**
 * Debug function to test email trigger creation and flow activation
 */
export const testEmailTriggerDebug = onCall({
  cors: true,
  region: 'us-central1'
}, async (request) => {
  try {
    if (!request.auth) {
      throw new HttpsError('unauthenticated', 'Unauthorized');
    }

    const { flowId } = request.data;
    if (!flowId) {
      throw new HttpsError('invalid-argument', 'Missing flowId');
    }

    const userId = request.auth.uid;

    // Get flow data
    const flowDoc = await goals_db.collection('flows').doc(flowId).get();
    if (!flowDoc.exists) {
      throw new HttpsError('not-found', 'Flow not found');
    }

    const flowData = flowDoc.data();
    if (flowData?.creator_id !== userId) {
      throw new HttpsError('permission-denied', 'Not your flow');
    }

    // Check if it's an email trigger
    if (flowData.trigger?.node_id !== 'EMAIL_TRIGGER') {
      throw new HttpsError('invalid-argument', 'Not an email trigger flow');
    }

    // Get email triggers for this flow
    const emailTriggersQuery = await goals_db
      .collection('emailTriggers')
      .where('flow_id', '==', flowId)
      .get();

    const emailTriggers = emailTriggersQuery.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    // Get all email triggers for this user
    const userEmailTriggersQuery = await goals_db
      .collection('emailTriggers')
      .where('creator_id', '==', userId)
      .get();

    const userEmailTriggers = userEmailTriggersQuery.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    // Check trigger props in flow
    const triggerProps = flowData.trigger?.propsData;

    return {
      success: true,
      debug: {
        flowId,
        userId,
        flowStatus: flowData.status,
        triggerNodeId: flowData.trigger?.node_id,
        triggerProps,
        emailTriggersForFlow: emailTriggers,
        allUserEmailTriggers: userEmailTriggers,
        flowCreatedAt: flowData.created_at,
        flowUpdatedAt: flowData.updated_at
      }
    };

  } catch (error) {
    console.error('Debug test error:', error);
    throw error;
  }
});

/**
 * Debug function to manually create an email trigger for testing
 */
export const createTestEmailTrigger = onCall({
  cors: true,
  region: 'us-central1'
}, async (request) => {
  try {
    if (!request.auth) {
      throw new HttpsError('unauthenticated', 'Unauthorized');
    }

    const { flowId, triggerId, email } = request.data;
    if (!flowId || !triggerId || !email) {
      throw new HttpsError('invalid-argument', 'Missing required parameters');
    }

    const userId = request.auth.uid;

    // Create the email trigger manually
    const emailTrigger = {
      id: triggerId,
      flow_id: flowId,
      creator_id: userId,
      unique_email: email,
      trigger_id: triggerId,
      status: 'active',
      settings: {
        include_attachments: false,
        max_attachment_size_mb: 10,
        send_auto_reply: false,
        max_triggers_per_hour: 60,
        max_triggers_per_day: 500
      },
      created_at: new Date(),
      updated_at: new Date(),
      trigger_count: 0
    };

    // Save to database
    await goals_db.collection('emailTriggers').doc(triggerId).set(emailTrigger);

    // Update flow with trigger info
    await goals_db.collection('flows').doc(flowId).update({
      'trigger.propsData.unique_email': email,
      'trigger.propsData.trigger_id': triggerId,
      status: 1,
      updated_at: new Date()
    });

    return {
      success: true,
      message: 'Test email trigger created successfully',
      emailTrigger
    };

  } catch (error) {
    console.error('Create test trigger error:', error);
    throw error;
  }
});

/**
 * Test function to verify email content is properly passed to flow nodes
 */
export const testEmailContentFlow = onCall({
  cors: true,
  region: 'us-central1'
}, async (request) => {
  try {
    if (!request.auth) {
      throw new HttpsError('unauthenticated', 'Unauthorized');
    }

    const { flowId, triggerId } = request.data;
    if (!flowId || !triggerId) {
      throw new HttpsError('invalid-argument', 'Missing required parameters');
    }

    const userId = request.auth.uid;

    // Verify the email trigger exists and belongs to the user
    const triggerDoc = await goals_db.collection('emailTriggers').doc(triggerId).get();
    if (!triggerDoc.exists) {
      throw new HttpsError('not-found', 'Email trigger not found');
    }

    const triggerData = triggerDoc.data();
    if (triggerData?.creator_id !== userId || triggerData?.flow_id !== flowId) {
      throw new HttpsError('permission-denied', 'Not your email trigger');
    }

    // Create test email data that simulates what would come from the webhook
    const testEmailData = {
      from_email: 'test@example.com',
      from_name: 'Test Sender',
      to_email: triggerData.unique_email,
      subject: 'Test Email for Content Flow Verification',
      body_text: 'This is a test email body to verify that email content is properly passed to subsequent nodes in the flow.',
      body_html: '<p>This is a test email body to verify that email content is properly passed to subsequent nodes in the flow.</p>',
      received_at: new Date().toISOString(),
      message_id: 'test-message-123',
      trigger_email: triggerData.unique_email,
      account_id: 'test-account',
      attachments: [],
      headers: { 'test-header': 'test-value' },
      trigger_type: 'email',
      raw_payload: {
        messageId: 'test-message-123',
        subject: 'Test Email for Content Flow Verification',
        fromAddress: 'test@example.com',
        fromName: 'Test Sender',
        toAddress: [triggerData.unique_email],
        date: new Date().toISOString(),
        hasAttachment: false
      }
    };

    // Simulate the flow execution with email data
    console.log('Testing email content flow with data:', testEmailData);

    // Import and test the email trigger node directly
    const { emailTriggerNode } = await import('../flows/executeFlow/flowSteps/node/trigger/emailTrigger.js');

    const mockContext = {
      run: async (stepName: string, fn: () => any) => {
        console.log(`Executing step: ${stepName}`);
        return await fn();
      }
    };

    const mockStep: any = {
      position: 0,
      node_id: 'EMAIL_TRIGGER',
      icon: '/icons/mail.svg',
      name: 'Test Email Trigger',
      description: 'Test email trigger node',
      type: 'trigger',
      provider: 'GOALMATIC',
      category: 'MESSAGING',
      propsData: {}
    };

    const previousStepResult = {
      "trigger-data": testEmailData
    };

    // Execute the email trigger node
    const result = await emailTriggerNode.run(mockContext as any, mockStep, previousStepResult);

    console.log('Email trigger node result:', JSON.stringify(result, null, 2));

    // Verify that all expected email content is present in the result
    const expectedFields = [
      'from_email', 'from_name', 'to_email', 'subject',
      'body_text', 'body_html', 'received_at', 'message_id',
      'sender', 'sender_name', 'email_subject', 'email_body',
      'attachments', 'trigger_email', 'has_attachments'
    ];

    const missingFields = expectedFields.filter(field => !(field in (result.payload || {})));

    return {
      success: result.success && missingFields.length === 0,
      message: result.success ?
        'Email content flow test passed - all fields are properly passed' :
        'Email content flow test failed',
      result: {
        nodeResult: result,
        missingFields,
        availableFields: result.payload ? Object.keys(result.payload) : [],
        emailDataPassed: !!result.payload,
        allFieldsPresent: missingFields.length === 0
      },
      testData: testEmailData
    };

  } catch (error) {
    console.error('Email content flow test error:', error);
    throw error;
  }
});
