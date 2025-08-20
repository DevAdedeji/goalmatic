import { goals_db } from '../../../init';
import { HttpsError } from 'firebase-functions/v2/https';
import { Client } from "@upstash/qstash";



export const handleDeactivateScheduleTimeTrigger = async (flowData: any, userId: string) => {

  const UPSTASH_QSTASH_TOKEN = process.env.UPSTASH_QSTASH_TOKEN || process.env.QSTASH_TOKEN;
  const qstashClient = new Client({ token: UPSTASH_QSTASH_TOKEN });
  
  try {
    // Check if the flow has a scheduled message
    if (!flowData.schedule || !flowData.schedule.messageId) {
      // Mark flow as inactive and clear schedule when no scheduled message exists
      try {
        await goals_db.collection('flows').doc(flowData.id).update({
          status: 0,
          schedule: null
        });
      } catch (_updateError) {
        // Best-effort update; proceed to return error regardless
      }
      throw new HttpsError('not-found', 'No scheduled message found for this flow');
    }

    const messageId = flowData.schedule.messageId;

    try {
      // Cancel the scheduled message
      await qstashClient.messages.delete(messageId);
    } catch (qstashError: any) {
      if (qstashError.status === 404) { 
        await goals_db.collection('flows').doc(flowData.id).update({
      status: 0,
      schedule: null
    });
      }
      else {
        throw new Error(`Failed to cancel scheduled message: ${qstashError.message || 'Unknown QStash error'}`);
      }
    }

    // Update the flow status to inactive and remove schedule information
    await goals_db.collection('flows').doc(flowData.id).update({
      status: 0,
      schedule: null
    });

    return {
      success: true,
      messageId: messageId,
      deactivatedAt: new Date().toISOString()
    };
  } catch (error: any) {
    if (error instanceof HttpsError) {
      throw error;
    }
    throw new HttpsError('internal', `${error.message || error}`);
  }
}
