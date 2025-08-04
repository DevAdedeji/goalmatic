import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { goals_db } from '../init';

// Constants
const EMAIL_DOMAIN = 'goalmatic.io';

/**
 * Generate a unique email address for the trigger
 * Format: {userPrefix}{flowPrefix}{randomSuffix}@goalmatic.io
 */
function generateUniqueEmail(userId: string, flowId: string): { triggerId: string; email: string } {
  // Take first 3 characters of user ID (alphanumeric only)
  const userPrefix = userId
    .replace(/[^a-zA-Z0-9]/g, '')
    .substring(0, 3)
    .toLowerCase();

  // Take first 3 characters of flow ID (alphanumeric only)
  const flowPrefix = flowId
    .replace(/[^a-zA-Z0-9]/g, '')
    .substring(0, 3)
    .toLowerCase();

  // Add a short random suffix to ensure uniqueness in edge cases
  const randomSuffix = Math.random().toString(36).substring(2, 4);

  const triggerId = `${userPrefix}${flowPrefix}${randomSuffix}`;
  const email = `${triggerId}@${EMAIL_DOMAIN}`;

  return { triggerId, email };
}

/**
 * Check if email address is already in use
 */
async function isEmailAddressAvailable(email: string): Promise<boolean> {
  const existingTrigger = await goals_db
    .collection('emailTriggers')
    .where('unique_email', '==', email)
    .limit(1)
    .get();

  return existingTrigger.empty;
}

/**
 * Generate a unique email address that's guaranteed to be available
 */
async function generateAvailableEmail(userId: string, flowId: string): Promise<{ triggerId: string; email: string }> {
  let attempts = 0;
  const maxAttempts = 10;

  while (attempts < maxAttempts) {
    const { triggerId, email } = generateUniqueEmail(userId, flowId);

    if (await isEmailAddressAvailable(email)) {
      return { triggerId, email };
    }

    attempts++;
  }

  // If we couldn't generate a unique email after maxAttempts, fall back to UUID
  const fallbackId = Math.random().toString(36).substring(2, 10);
  const fallbackEmail = `${fallbackId}@${EMAIL_DOMAIN}`;

  return {
    triggerId: fallbackId,
    email: fallbackEmail
  };
}

/**
 * Firebase Cloud Function to generate email address for email triggers
 */
export const generateEmailAddress = onCall({
  cors: true,
  region: 'us-central1'
}, async (request) => {
  try {
    // Check authentication
    if (!request.auth) {
      throw new HttpsError('unauthenticated', 'User must be authenticated');
    }

    const { flowId } = request.data;
    const userId = request.auth.uid;

    // Validate required parameters
    if (!flowId) {
      throw new HttpsError('invalid-argument', 'Missing required parameter: flowId');
    }

    // Validate that the flow exists and belongs to the user
    const flowDoc = await goals_db.collection('flows').doc(flowId).get();
    if (!flowDoc.exists) {
      throw new HttpsError('not-found', 'Flow not found');
    }

    const flowData = flowDoc.data();
    if (flowData?.creator_id !== userId) {
      throw new HttpsError('permission-denied', 'You do not have permission to create triggers for this flow');
    }

    // Check if flow already has an email trigger
    const existingTrigger = await goals_db
      .collection('emailTriggers')
      .where('flow_id', '==', flowId)
      .where('creator_id', '==', userId)
      .limit(1)
      .get();

    if (!existingTrigger.empty) {
      // Return existing email address
      const triggerData = existingTrigger.docs[0].data();
      return {
        success: true,
        unique_email: triggerData.unique_email,
        trigger_id: triggerData.id,
        is_existing: true
      };
    }

    // Generate new unique email address
    const { triggerId, email } = await generateAvailableEmail(userId, flowId);

    // Update the flow with the generated email address (but don't create the trigger yet)
    await goals_db.collection('flows').doc(flowId).update({
      'trigger.propsData.unique_email': email,
      'trigger.propsData.trigger_id': triggerId,
      updated_at: new Date()
    });

    console.log(`Generated email address ${email} for flow ${flowId} (user: ${userId})`);

    return {
      success: true,
      unique_email: email,
      trigger_id: triggerId,
      is_existing: false
    };

  } catch (error) {
    console.error('Error generating email address:', error);

    if (error instanceof HttpsError) {
      throw error;
    }

    throw new HttpsError('internal', `Failed to generate email address: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
});
