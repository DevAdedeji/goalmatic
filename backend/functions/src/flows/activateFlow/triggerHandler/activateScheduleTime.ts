import { goals_db, is_dev } from '../../../init';
import { v4 as uuidv4 } from 'uuid';
import { HttpsError } from 'firebase-functions/v2/https';
import { Client } from "@upstash/qstash";
import moment from 'moment-timezone';
import { Timestamp } from 'firebase-admin/firestore';

const UPSTASH_QSTASH_TOKEN = process.env.UPSTASH_QSTASH_TOKEN;
const API_BASE_URL = is_dev ? `${process.env.BASE_URL_DEV}/executeFlow` : `${process.env.BASE_URL}/executeFlow`;
const FAILURE_CALLBACK_URL = is_dev ? `${process.env.BASE_URL_DEV}/failedScheduleTimeCallback` : `${process.env.BASE_URL}/failedScheduleTimeCallback`;

const qstashClient = new Client({ token: UPSTASH_QSTASH_TOKEN });


export const handleActivateScheduleTimeTrigger = async (flowData: any, userId: string) => {
  const { propsData } = flowData.trigger;

  if (!propsData || !propsData.date || !propsData.time || !propsData.timezone) {
    throw new HttpsError('invalid-argument', 'Missing date, time, or timezone in trigger configuration');
  }

  const { date: scheduleDate, time: scheduleTime, timezone } = propsData;
  let scheduledDateTime: Date;

  const [year, month, day] = scheduleDate.split('-').map(Number);
  const [hour, minute] = scheduleTime.split(':').map(Number);



  try {

    if (isNaN(year) || isNaN(month) || isNaN(day) || isNaN(hour) || isNaN(minute)) {
      throw new Error(`Invalid date/time format: ${scheduleDate} ${scheduleTime}`);
    }


    const tzOffsetMinutes = moment.tz(timezone).utcOffset();

    const timeInMinutes = hour * 60 + minute;

    const utcTimeInMinutes = (timeInMinutes - tzOffsetMinutes + 1440) % 1440;


    const utcHour = Math.floor(utcTimeInMinutes / 60);
    const utcMinute = utcTimeInMinutes % 60;


    scheduledDateTime = new Date(Date.UTC(year, month - 1, day, utcHour, utcMinute, 0));

    if (isNaN(scheduledDateTime.getTime())) {
      throw new Error(`Could not convert time to UTC for date: ${scheduleDate}, time: ${scheduleTime}, timezone: ${timezone}`);
    }



  } catch (error: any) {
    if (error instanceof HttpsError) {
      throw error;
    }
    throw new HttpsError('invalid-argument',
      `${error.message}`);
  }



  const notBeforeTimestamp = Math.floor(scheduledDateTime.getTime() / 1000);
  const currentTimestampSeconds = Math.floor(new Date().getTime() / 1000);



  const PAST_BUFFER_SECONDS = -15;
  if (notBeforeTimestamp < currentTimestampSeconds + PAST_BUFFER_SECONDS) {
    throw new HttpsError('invalid-argument', `Scheduled time is in the past.`);
  }

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
      qstashResponse = await qstashClient.publishJSON({
        url: webhookUrl,
        body: payload,
        notBefore: notBeforeTimestamp, // Unix timestamp in seconds (UTC)
        failureCallback: FAILURE_CALLBACK_URL, // Add failure callback URL
        retries: 1 // Set max retries explicitly
      });

    } catch (qstashError: any) {
      throw new Error(`${qstashError.message || 'Unknown SDK error'}`);
    }

    if (!qstashResponse?.messageId) {
      throw new Error(`${JSON.stringify(qstashResponse)}`);
    }

    const updateTime = new Date();
    await goals_db.collection('flows').doc(flowData.id).update({
      status: 1,
      schedule: {
        messageId: qstashResponse.messageId, // Use messageId from SDK response
        scheduledFor: scheduledDateTime.toISOString(),
        createdAt: Timestamp.fromDate(updateTime)
      }
    });

    return {
      success: true,
      messageId: qstashResponse.messageId, // Return messageId from SDK response
      scheduledFor: scheduledDateTime.toISOString(),
      executionId
    };
  } catch (error: any) {
    console.error('Error in handleScheduleTimeTrigger during QStash/DB update:', error);
    throw new HttpsError('internal', `${error.message || error}`);
  }
}
