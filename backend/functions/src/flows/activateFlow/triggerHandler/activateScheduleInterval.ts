import { goals_db, is_dev } from '../../../init';
import { v4 as uuidv4 } from 'uuid';
import { HttpsError } from 'firebase-functions/v2/https';
import { Client } from "@upstash/qstash";
import { Timestamp } from 'firebase-admin/firestore';
import moment from 'moment-timezone';

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
  const timezone: string | undefined = propsData.timezone;

 

  try {
    const executionId = uuidv4();
    const webhookUrl = API_BASE_URL;
    const payload = {
      flowId: flowData.id,
      userId,
      executionId
    };

    let qstashResponse;
    // Determine the cron to use (UTC-adjusted if timezone is provided)
    let cronToUse = cron;
    try {
      // QStash cron is evaluated in UTC. If user provided a timezone and the cron encodes a specific local time,
      // convert that local time to equivalent UTC cron.
      if (timezone && typeof timezone === 'string') {
        try {
          const parts = cron.trim().split(/\s+/);
          if (parts.length === 5) {
            const [min, hour, dom, mon, dow] = parts;
            const nowTz = moment.tz(timezone);
            const sample = moment.tz({
              year: nowTz.year(),
              month: nowTz.month(),
              date: nowTz.date(),
              hour: isNaN(parseInt(hour)) ? nowTz.hour() : parseInt(hour),
              minute: isNaN(parseInt(min)) ? nowTz.minute() : parseInt(min)
            }, timezone).utc();
            const utcHour = sample.hour();
            const utcMin = sample.minute();
            // Replace only hour/min fields when they are concrete numbers
            const newHour = /[^0-9*,/\-]/.test(hour) ? hour : String(utcHour);
            const newMin = /[^0-9*/,/\-]/.test(min) ? min : String(utcMin);
            cronToUse = `${newMin} ${newHour} ${dom} ${mon} ${dow}`;
          }
        } catch {}
      }

      qstashResponse = await qstashClient.schedules.create({
        destination: webhookUrl,
        cron: cronToUse,
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
        // Store the actual cron used by QStash and the original/local intent
        cron: cron,
        cron_used: cronToUse,
        timezone: timezone || null,
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