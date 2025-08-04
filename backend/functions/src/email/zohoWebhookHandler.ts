import { onRequest } from 'firebase-functions/v2/https';
import { goals_db } from '../init';
import { v4 as uuidv4 } from 'uuid';
import { Timestamp } from 'firebase-admin/firestore';
import { Client } from "@upstash/qstash";
import { is_dev } from '../init';

// Result interface for webhook processing
interface WebhookProcessingResult {
  triggerId: string;
  flowId?: string;
  executionId?: string;
  status: 'processed' | 'failed';
  error?: string;
}

// Types for Zoho Mail webhook payload
interface ZohoWebhookPayloadV1 {
  messageId: string;
  folder: string;
  subject: string;
  fromAddress: string;
  toAddress: string[];
  ccAddress?: string[];
  bccAddress?: string[];
  date: string;
  size: number;
  hasAttachment: boolean;
  isRead: boolean;
  isPriority: boolean;
  accountId: string;
  folderId: string;
}

interface ZohoWebhookPayloadV2 {
  event: 'email_received';
  timestamp: string;
  data: {
    messageId: string;
    accountId: string;
    subject: string;
    from: {
      address: string;
      name?: string;
    };
    to: Array<{
      address: string;
      name?: string;
    }>;
    cc?: Array<{
      address: string;
      name?: string;
    }>;
    date: string;
    hasAttachment: boolean;
    attachments?: Array<{
      fileName: string;
      size: number;
      contentType: string;
    }>;
    preview?: string;
  };
}

type ZohoWebhookPayload = ZohoWebhookPayloadV1 | ZohoWebhookPayloadV2;

// Email trigger settings interface
interface EmailTriggerSettings {
  allowed_senders?: string[];
  blocked_senders?: string[];
  subject_filters?: {
    include?: string[];
    exclude?: string[];
  };
  max_triggers_per_hour?: number;
  max_triggers_per_day?: number;
  include_attachments: boolean;
  max_attachment_size_mb: number;
  allowed_attachment_types?: string[];
  send_auto_reply: boolean;
  auto_reply_message?: string;
}

interface EmailTrigger {
  id: string;
  flow_id: string;
  creator_id: string;
  unique_email: string;
  status: 'active' | 'inactive' | 'suspended';
  settings: EmailTriggerSettings;
  created_at: Timestamp;
  last_triggered?: Timestamp;
  trigger_count: number;
}

// Constants
const UPSTASH_QSTASH_TOKEN = process.env.UPSTASH_QSTASH_TOKEN;
const API_BASE_URL = is_dev ? `${process.env.BASE_URL_DEV}/executeFlow` : `${process.env.BASE_URL}/executeFlow`;
const ZOHO_WEBHOOK_SECRET = process.env.ZOHO_WEBHOOK_SECRET; // For webhook security

/**
 * Extract email address from trigger email to get trigger ID
 * Expected format: trigger-{triggerId}@goalmatic.io
 */
function extractTriggerIdFromEmail(email: string): string | null {
  const match = email.match(/^trigger-([a-zA-Z0-9]+)@goalmatic\.io$/);
  return match ? match[1] : null;
}

/**
 * Normalize webhook payload to a common format
 */
function normalizeWebhookPayload(payload: ZohoWebhookPayload): any {
  // Handle V2 format (newer)
  if ('event' in payload && payload.event === 'email_received') {
    return {
      messageId: payload.data.messageId,
      subject: payload.data.subject,
      fromAddress: payload.data.from.address,
      fromName: payload.data.from.name,
      toAddress: payload.data.to.map(t => t.address),
      ccAddress: payload.data.cc?.map(c => c.address) || [],
      date: payload.data.date,
      hasAttachment: payload.data.hasAttachment,
      attachments: payload.data.attachments || [],
      preview: payload.data.preview,
      accountId: payload.data.accountId
    };
  }

  // Handle V1 format (legacy)
  else {
    const v1Payload = payload as ZohoWebhookPayloadV1;
    return {
      messageId: v1Payload.messageId,
      subject: v1Payload.subject,
      fromAddress: v1Payload.fromAddress,
      fromName: undefined,
      toAddress: v1Payload.toAddress,
      ccAddress: v1Payload.ccAddress || [],
      date: v1Payload.date,
      hasAttachment: v1Payload.hasAttachment,
      attachments: [],
      preview: undefined,
      accountId: v1Payload.accountId
    };
  }
}

/**
 * Validate webhook security (if secret is configured)
 */
function validateWebhookSecurity(headers: any, body: string): boolean {
  if (!ZOHO_WEBHOOK_SECRET) {
    console.warn('ZOHO_WEBHOOK_SECRET not configured - webhook security disabled');
    return true;
  }

  const signature = headers['x-zoho-signature'] || headers['X-Zoho-Signature'];
  if (!signature) {
    console.error('Missing webhook signature');
    return false;
  }

  // Implement signature validation based on Zoho's documentation
  // This would typically involve HMAC-SHA256 verification
  // For now, we'll do a simple comparison (replace with proper HMAC validation)
  const expectedSignature = `sha256=${Buffer.from(body + ZOHO_WEBHOOK_SECRET).toString('base64')}`;

  return signature === expectedSignature;
}

/**
 * Check if email passes trigger filters
 */
function passesFilters(normalizedPayload: any, settings: EmailTriggerSettings): { passes: boolean; reason?: string } {
  const { fromAddress, subject } = normalizedPayload;

  // Check blocked senders
  if (settings.blocked_senders?.some(blocked => fromAddress.toLowerCase().includes(blocked.toLowerCase()))) {
    return { passes: false, reason: 'SENDER_BLOCKED' };
  }

  // Check allowed senders (if configured)
  if (settings.allowed_senders?.length &&
      !settings.allowed_senders.some(allowed => fromAddress.toLowerCase().includes(allowed.toLowerCase()))) {
    return { passes: false, reason: 'SENDER_NOT_ALLOWED' };
  }

  // Check subject exclusions
  if (settings.subject_filters?.exclude?.some(exclude =>
      subject.toLowerCase().includes(exclude.toLowerCase()))) {
    return { passes: false, reason: 'SUBJECT_FILTERED' };
  }

  // Check subject inclusions (if configured)
  if (settings.subject_filters?.include?.length &&
      !settings.subject_filters.include.some(include =>
        subject.toLowerCase().includes(include.toLowerCase()))) {
    return { passes: false, reason: 'SUBJECT_NOT_INCLUDED' };
  }

  return { passes: true };
}

/**
 * Check rate limits for trigger
 */
async function checkRateLimit(triggerId: string, settings: EmailTriggerSettings): Promise<{ allowed: boolean; reason?: string }> {
  const now = new Date();
  const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
  const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

  // Query recent email executions
  const recentExecutions = await goals_db
    .collection('emailTriggerLogs')
    .where('trigger_id', '==', triggerId)
    .where('received_at', '>=', Timestamp.fromDate(oneHourAgo))
    .get();

  const hourlyCount = recentExecutions.docs.length;
  const dailyExecutions = recentExecutions.docs.filter(doc =>
    doc.data().received_at.toDate() >= oneDayAgo
  );
  const dailyCount = dailyExecutions.length;

  // Check hourly limit
  if (settings.max_triggers_per_hour && hourlyCount >= settings.max_triggers_per_hour) {
    return { allowed: false, reason: 'HOURLY_RATE_LIMIT_EXCEEDED' };
  }

  // Check daily limit
  if (settings.max_triggers_per_day && dailyCount >= settings.max_triggers_per_day) {
    return { allowed: false, reason: 'DAILY_RATE_LIMIT_EXCEEDED' };
  }

  return { allowed: true };
}

/**
 * Log email trigger execution
 */
async function logEmailTrigger(
  triggerId: string,
  flowId: string,
  normalizedPayload: any,
  status: 'processed' | 'filtered' | 'failed',
  reason?: string,
  executionId?: string
): Promise<void> {
  const logId = uuidv4();

  await goals_db.collection('emailTriggerLogs').doc(logId).set({
    id: logId,
    trigger_id: triggerId,
    flow_id: flowId,
    message_id: normalizedPayload.messageId,
    from_address: normalizedPayload.fromAddress,
    subject: normalizedPayload.subject,
    received_at: Timestamp.now(),
    status,
    reason,
    execution_id: executionId,
    created_at: Timestamp.now()
  });
}

/**
 * Execute flow with email data
 */
async function executeFlowWithEmailData(
  flowId: string,
  userId: string,
  normalizedPayload: any
): Promise<string> {
  const executionId = uuidv4();
  const qstashClient = new Client({ token: UPSTASH_QSTASH_TOKEN });

  // Prepare email flow input data
  const emailFlowInput = {
    from_email: normalizedPayload.fromAddress,
    from_name: normalizedPayload.fromName,
    to_email: normalizedPayload.toAddress[0], // Primary recipient
    subject: normalizedPayload.subject,
    body_text: normalizedPayload.preview,
    body_html: undefined, // Would need to fetch full email content via Zoho API
    received_at: normalizedPayload.date,
    message_id: normalizedPayload.messageId,
    headers: {},
    attachments: normalizedPayload.hasAttachment ? normalizedPayload.attachments : [],
    trigger_email: normalizedPayload.toAddress[0],
    account_id: normalizedPayload.accountId
  };

  // Store email data for flow execution
  await goals_db.collection('emailFlowInputs').doc(executionId).set({
    execution_id: executionId,
    flow_id: flowId,
    email_data: emailFlowInput,
    created_at: Timestamp.now()
  });

  // Trigger flow execution via QStash
  await qstashClient.publishJSON({
    url: API_BASE_URL,
    body: {
      flowId,
      userId,
      executionId,
      triggerData: emailFlowInput
    }
  });

  return executionId;
}

/**
 * Main webhook handler
 */
export const zohoEmailWebhook = onRequest({
  cors: true,
  region: 'us-central1',
  maxInstances: 10
}, async (request, response) => {
  try {
    // Only accept POST requests
    if (request.method !== 'POST') {
      response.status(405).json({ error: 'Method not allowed' });
      return;
    }

    // Validate webhook security
    const bodyString = JSON.stringify(request.body);
    if (!validateWebhookSecurity(request.headers, bodyString)) {
      response.status(401).json({ error: 'Unauthorized' });
      return;
    }

    // Parse and normalize webhook payload
    const webhookPayload = request.body as ZohoWebhookPayload;
    const normalizedPayload = normalizeWebhookPayload(webhookPayload);

    console.log('Received email webhook:', {
      messageId: normalizedPayload.messageId,
      from: normalizedPayload.fromAddress,
      to: normalizedPayload.toAddress,
      subject: normalizedPayload.subject
    });

    // Process each recipient (there might be multiple triggers)
    const results: WebhookProcessingResult[] = [];

    for (const recipientEmail of normalizedPayload.toAddress) {
      const triggerId = extractTriggerIdFromEmail(recipientEmail);

      if (!triggerId) {
        console.log(`Skipping non-trigger email: ${recipientEmail}`);
        continue;
      }

      try {
        // Get email trigger configuration
        const triggerDoc = await goals_db
          .collection('emailTriggers')
          .doc(triggerId)
          .get();

        if (!triggerDoc.exists) {
          console.error(`Email trigger not found: ${triggerId}`);
          await logEmailTrigger(triggerId, '', normalizedPayload, 'failed', 'TRIGGER_NOT_FOUND');
          continue;
        }

        const triggerData = triggerDoc.data() as EmailTrigger;

        // Check if trigger is active
        if (triggerData.status !== 'active') {
          console.log(`Email trigger inactive: ${triggerId}`);
          await logEmailTrigger(triggerId, triggerData.flow_id, normalizedPayload, 'filtered', 'TRIGGER_INACTIVE');
          continue;
        }

        // Check filters
        const filterResult = passesFilters(normalizedPayload, triggerData.settings);
        if (!filterResult.passes) {
          console.log(`Email filtered: ${filterResult.reason}`);
          await logEmailTrigger(triggerId, triggerData.flow_id, normalizedPayload, 'filtered', filterResult.reason);
          continue;
        }

        // Check rate limits
        const rateLimitResult = await checkRateLimit(triggerId, triggerData.settings);
        if (!rateLimitResult.allowed) {
          console.log(`Rate limit exceeded: ${rateLimitResult.reason}`);
          await logEmailTrigger(triggerId, triggerData.flow_id, normalizedPayload, 'filtered', rateLimitResult.reason);
          continue;
        }

        // Get flow data to verify it exists and is active
        const flowDoc = await goals_db
          .collection('flows')
          .doc(triggerData.flow_id)
          .get();

        if (!flowDoc.exists) {
          console.error(`Flow not found: ${triggerData.flow_id}`);
          await logEmailTrigger(triggerId, triggerData.flow_id, normalizedPayload, 'failed', 'FLOW_NOT_FOUND');
          continue;
        }

        const flowData = flowDoc.data();
        if (flowData?.status !== 1) {
          console.log(`Flow inactive: ${triggerData.flow_id}`);
          await logEmailTrigger(triggerId, triggerData.flow_id, normalizedPayload, 'filtered', 'FLOW_INACTIVE');
          continue;
        }

        // Execute the flow
        const executionId = await executeFlowWithEmailData(
          triggerData.flow_id,
          triggerData.creator_id,
          normalizedPayload
        );

        // Update trigger statistics
        await goals_db.collection('emailTriggers').doc(triggerId).update({
          last_triggered: Timestamp.now(),
          trigger_count: (triggerData.trigger_count || 0) + 1
        });

        // Log successful processing
        await logEmailTrigger(triggerId, triggerData.flow_id, normalizedPayload, 'processed', undefined, executionId);

        results.push({
          triggerId,
          flowId: triggerData.flow_id,
          executionId,
          status: 'processed'
        });

        console.log(`Successfully triggered flow ${triggerData.flow_id} with execution ID: ${executionId}`);

      } catch (error) {
        console.error(`Error processing trigger ${triggerId}:`, error);
        await logEmailTrigger(triggerId, '', normalizedPayload, 'failed', 'PROCESSING_ERROR');

        results.push({
          triggerId,
          status: 'failed',
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    // Return success response
    response.status(200).json({
      success: true,
      message: 'Webhook processed successfully',
      processed_triggers: results.length,
      results
    });
    return;

  } catch (error) {
    console.error('Error processing Zoho email webhook:', error);
    response.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
    return;
  }
});
