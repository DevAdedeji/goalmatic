import { goals_db } from '../../../init';
import { HttpsError } from 'firebase-functions/v2/https';

export const handleDeactivateEmailTrigger = async (flowData: any, userId: string) => {
  try {
    // Get the email trigger data from the flow
    const triggerEmail = flowData.trigger?.propsData?.email;
    const triggerId = flowData.trigger?.propsData?.trigger_id;

    // If there's a trigger ID, update the email trigger status to inactive
    if (triggerId) {
      try {
        const emailTriggerRef = goals_db.collection('emailTriggers').doc(triggerId);
        const emailTriggerDoc = await emailTriggerRef.get();

        if (emailTriggerDoc.exists) {
          const emailTriggerData = emailTriggerDoc.data();
          // Only update if the user owns this trigger
          if (emailTriggerData?.creator_id === userId) {
            await emailTriggerRef.update({
              status: 0, // inactive
              updated_at: new Date()
            });
          }
        }
      } catch (emailTriggerError) {
        // Log the error but don't fail the deactivation
        console.error('Error updating email trigger status:', emailTriggerError);
      }
    }

    // Update the flow status to inactive and clear trigger data
    await goals_db.collection('flows').doc(flowData.id).update({
      status: 0,
      'trigger.propsData.email': null,
      'trigger.propsData.trigger_id': null,
      updated_at: new Date()
    });

    return {
      success: true,
      triggerEmail: triggerEmail,
      triggerId: triggerId,
      deactivatedAt: new Date().toISOString()
    };
  } catch (error: any) {
    if (error instanceof HttpsError) {
      throw error;
    }
    throw new HttpsError('internal', `${error.message || error}`);
  }
};