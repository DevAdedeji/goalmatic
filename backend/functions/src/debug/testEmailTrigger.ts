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
