import { goals_db, is_dev } from '../../../init';
import { v4 as uuidv4 } from 'uuid';
import { HttpsError } from 'firebase-functions/v2/https';
import { Client } from "@upstash/qstash";
import { Timestamp } from 'firebase-admin/firestore';

const UPSTASH_QSTASH_TOKEN = process.env.UPSTASH_QSTASH_TOKEN || process.env.QSTASH_TOKEN;
const API_BASE_URL = is_dev ? `${process.env.BASE_URL_DEV}/executeFlow` : `${process.env.BASE_URL}/executeFlow`;
const FAILURE_CALLBACK_URL = is_dev ? `${process.env.BASE_URL_DEV}/failedScheduleTimeCallback` : `${process.env.BASE_URL}/failedScheduleTimeCallback`;



export const handleActivateScheduleIntervalTrigger = async (flowData: any, userId: string) => {
  
  const qstashClient = new Client({ token: UPSTASH_QSTASH_TOKEN });

  const { propsData } = flowData.trigger;

  if (!propsData || !propsData.cron) {
    throw new HttpsError('invalid-argument', 'Missing cron expression in trigger configuration');
  }

  const { cron } = propsData;

 

  try {
    const executionId = uuidv4();
    const webhookUrl = API_BASE_URL;
    const payload = {
      flowId: flowData.id,
      userId,
      executionId
    };

    let qstashResponse;
    try {
      qstashResponse = await qstashClient.schedules.create({
        destination: webhookUrl,
        cron,
        body: JSON.stringify(payload),
        failureCallback: FAILURE_CALLBACK_URL,
        retries: 1
      });
    } catch (qstashError: any) {
      throw new Error(`${qstashError.message || 'Unknown SDK error'}`);
    }

    if (!qstashResponse?.scheduleId) {
      throw new Error(`${JSON.stringify(qstashResponse)}`);
    }

    const updateTime = new Date();
    await goals_db.collection('flows').doc(flowData.id).update({
      status: 1,
      schedule: {
        scheduleId: qstashResponse.scheduleId,
        cron,
        createdAt: Timestamp.fromDate(updateTime)
      }
    });

    return {
      success: true,
      scheduleId: qstashResponse.scheduleId,
      cron,
      executionId
    };
  } catch (error: any) {
    throw new HttpsError('internal', `${error.message || error}`);
  }
} 