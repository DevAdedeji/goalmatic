import { tool } from 'ai';
import { z } from 'zod';
import { Client } from '@upstash/qstash';
import { v4 as uuidv4 } from 'uuid';
import { goals_db, is_dev } from '../../../init';
import { getUserUid, getUserToolConfig } from '../../index';

const UPSTASH_QSTASH_TOKEN = process.env.UPSTASH_QSTASH_TOKEN as string;
const API_BASE_URL = is_dev
    ? `${process.env.BASE_URL_DEV}/deliverReminder`
    : `${process.env.BASE_URL}/deliverReminder`;
const FAILURE_CALLBACK_URL = is_dev
    ? `${process.env.BASE_URL_DEV}/failedScheduleTimeCallback`
    : `${process.env.BASE_URL}/failedScheduleTimeCallback`;

type DeliveryMethod = 'WHATSAPP' | 'EMAIL';

const setReminder = async (params: {
    message: string;
    deliveryMethod?: DeliveryMethod;
    delayMinutes?: number;
    scheduleAtIso?: string;
}): Promise<{ success: boolean; reminderId: string; scheduledFor: string; deliveryMethod: DeliveryMethod }> => {
    const uid = getUserUid();
    if (!uid) throw new Error('User authentication required');

    const userToolConfig = getUserToolConfig?.() || {};
    const defaultMethod: DeliveryMethod =
        userToolConfig?.REMINDER?.default_delivery_method === 'EMAIL' ? 'EMAIL' : 'WHATSAPP';

    const deliveryMethod: DeliveryMethod = params.deliveryMethod || defaultMethod;

    // Compute schedule time
    let scheduledDate: Date | null = null;
    if (typeof params.delayMinutes === 'number' && params.delayMinutes >= 0) {
        scheduledDate = new Date(Date.now() + params.delayMinutes * 60 * 1000);
    } else if (params.scheduleAtIso) {
        const parsed = new Date(params.scheduleAtIso);
        if (!isNaN(parsed.getTime())) scheduledDate = parsed;
    }

    if (!scheduledDate) {
        throw new Error('Invalid schedule. Provide either delayMinutes (>= 0) or a valid scheduleAtIso.');
    }

    const notBeforeTimestampSeconds = Math.floor(scheduledDate.getTime() / 1000);
    const qstashClient = new Client({ token: UPSTASH_QSTASH_TOKEN });

    const reminderId = uuidv4();

    const payload = {
        reminderId,
        userId: uid,
        deliveryMethod,
        message: params.message,
        scheduledFor: scheduledDate.toISOString(),
    };

    try {
        const publishResp = await qstashClient.publishJSON({
            url: API_BASE_URL,
            body: payload,
            notBefore: notBeforeTimestampSeconds,
            failureCallback: FAILURE_CALLBACK_URL,
            retries: 1,
        });

        // Persist a record for visibility/cancellation (best-effort)
        try {
            await goals_db
                .collection('users')
                .doc(uid)
                .collection('reminders')
                .doc(reminderId)
                .set({
                    id: reminderId,
                    delivery_method: deliveryMethod,
                    message: params.message,
                    scheduled_for: scheduledDate.toISOString(),
                    qstash_message_id: publishResp?.messageId || null,
                    status: 'scheduled',
                    created_at: new Date().toISOString(),
                });
        } catch (persistErr) {
            console.warn('Failed to persist reminder record:', persistErr);
        }

        return {
            success: true,
            reminderId,
            scheduledFor: scheduledDate.toISOString(),
            deliveryMethod,
        };
    } catch (err: any) {
        throw new Error(`Failed to schedule reminder: ${err?.message || err}`);
    }
};

const setReminderTool = tool({
    description:
        'Schedule a reminder for the user. Prefer using delayMinutes for relative reminders (e.g., 5 for 5 minutes from now). Optionally set scheduleAtIso (RFC 3339 / ISO 8601) for an absolute time. Use deliveryMethod of WHATSAPP or EMAIL; if omitted, the agent default will be used.',
    parameters: z.object({
        message: z.string().describe('The reminder message to deliver to the user'),
        deliveryMethod: z
            .enum(['WHATSAPP', 'EMAIL'])
            .optional()
            .describe('Channel to deliver the reminder. Defaults to the agent configuration.'),
        delayMinutes: z
            .number()
            .int()
            .nonnegative()
            .optional()
            .describe('Minutes from now to deliver the reminder. Recommended for relative schedules.'),
        scheduleAtIso: z
            .string()
            .optional()
            .describe('Absolute schedule time in ISO 8601 format, e.g., 2025-01-01T09:00:00Z'),
    }),
    execute: async (input: any) => {
        return await setReminder(input);
    },
});

export const REMINDER_SET_TOOL = {
    id: 'SET_REMINDER',
    tool: setReminderTool,
};

