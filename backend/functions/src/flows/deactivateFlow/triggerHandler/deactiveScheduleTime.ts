import { goals_db } from '../../../init';
import { HttpsError } from 'firebase-functions/v2/https';
import { Client } from "@upstash/qstash";


const token = "eyJVc2VySUQiOiI4ZjU3MmQxZi02YjdlLTQ1MTktYWE5MS03YmMyYmFmYzkzZjYiLCJQYXNzd29yZCI6ImEyNzRhNzUwODdiNjRhNTQ4ZWI5ZDdiNzhiMjRmNTNhIn0="
const UPSTASH_QSTASH_TOKEN = token;

const qstashClient = new Client({ token: UPSTASH_QSTASH_TOKEN });

export const handleDeactivateScheduleTimeTrigger = async (flowData: any, userId: string) => {
  try {
    // Check if the flow has a scheduled message
    if (!flowData.schedule || !flowData.schedule.messageId) {
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
