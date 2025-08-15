import { goals_db } from '../../../init';
import { HttpsError } from 'firebase-functions/v2/https';
import { Client } from "@upstash/qstash";

const UPSTASH_QSTASH_TOKEN = process.env.UPSTASH_QSTASH_TOKEN || process.env.QSTASH_TOKEN;


export const handleDeactivateScheduleIntervalTrigger = async (flowData: any, userId: string) => {
  
  const qstashClient = new Client({ token: UPSTASH_QSTASH_TOKEN });
  try {
    // Check if the flow has a scheduled interval
    if (!flowData.schedule || !flowData.schedule.scheduleId) {
      throw new HttpsError('not-found', 'No scheduled interval found for this flow');
    }

    const scheduleId = flowData.schedule.scheduleId;

    try {
      // Cancel the scheduled interval
      await qstashClient.schedules.delete(scheduleId);
    } catch (qstashError: any) {
      if (qstashError.status === 404) {
        await goals_db.collection('flows').doc(flowData.id).update({
          status: 0,
          schedule: null
        });
      } else {
        throw new Error(`Failed to cancel scheduled interval: ${qstashError.message || 'Unknown QStash error'}`);
      }
    }

    // Update the flow status to inactive and remove schedule information
    await goals_db.collection('flows').doc(flowData.id).update({
      status: 0,
      schedule: null
    });

    return {
      success: true,
      scheduleId: scheduleId,
      deactivatedAt: new Date().toISOString()
    };
  } catch (error: any) {
    if (error instanceof HttpsError) {
      throw error;
    }
    throw new HttpsError('internal', `${error.message || error}`);
  }
} 