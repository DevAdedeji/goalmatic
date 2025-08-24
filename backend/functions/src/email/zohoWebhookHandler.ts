import { onRequest } from 'firebase-functions/v2/https';
import { goals_db } from '../init';
import { v4 as uuidv4 } from 'uuid';
import { Timestamp } from 'firebase-admin/firestore';
import { Client } from "@upstash/qstash";
import { is_dev } from '../init';
import { cleanupLogsForTrigger } from './cleanupEmailTriggerLogs';
import { getAnalytics } from '../utils/analytics';

// Result interface for webhook processing
interface WebhookProcessingResult {
  triggerId: string;
  flowId?: string;
  executionId?: string;
  status: 'processed' | 'failed' | 'testing';
  error?: string;
}

// Types for Zoho Mail webhook payload
interface ZohoWebhookPayloadV1 {
  messageId: string;
  folder: string;
  subject: string;
  fromAddress: string;
  toAddress: string[] | string; // Can be either array or single string
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

// Email trigger settings interface (simplified)
interface EmailTriggerSettings {
  max_triggers_per_hour?: number;
  max_triggers_per_day?: number;
  include_attachments: boolean;
  max_attachment_size_mb: number;
  allowed_attachment_types?: string[];
  send_auto_reply: boolean;
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
const UPSTASH_QSTASH_TOKEN = process.env.UPSTASH_QSTASH_TOKEN || process.env.QSTASH_TOKEN;
const API_BASE_URL = is_dev ? `${process.env.BASE_URL_DEV}/executeFlow` : `${process.env.BASE_URL}/executeFlow`;
const ZOHO_WEBHOOK_SECRET = process.env.ZOHO_WEBHOOK_SECRET; // For webhook security

/**
 * Clean email address by removing angle brackets and whitespace
 */
function cleanEmailAddress(email: string): string {
  return email.replace(/[<>]/g, '').trim();
}

/**
 * Extract email address from trigger email to get trigger ID
 * Expected format: trigger-{triggerId}@goalmatic.io
 */
function extractTriggerIdFromEmail(email: string): string | null {
  const cleanEmail = cleanEmailAddress(email);
  const match = cleanEmail.match(/^([a-zA-Z0-9]+)@goalmatic\.io$/);
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
      fromAddress: cleanEmailAddress(payload.data.from.address),
      fromName: payload.data.from.name,
      toAddress: payload.data.to.map(t => cleanEmailAddress(t.address)),
      ccAddress: payload.data.cc?.map(c => cleanEmailAddress(c.address)) || [],
      date: payload.data.date,
      hasAttachment: payload.data.hasAttachment,
      attachments: payload.data.attachments || [],
      preview: payload.data.preview,
      bodyHtml: (payload.data as any).html || '',
      bodyText: (payload.data as any).summary || payload.data.preview || '',
      accountId: payload.data.accountId
    };
  }

  // Handle V1 format (legacy)
  else {
    const v1Payload = payload as ZohoWebhookPayloadV1;

    // Ensure toAddress is always an array and clean email addresses
    let toAddressArray: string[];
    if (Array.isArray(v1Payload.toAddress)) {
      toAddressArray = v1Payload.toAddress.map(email => cleanEmailAddress(email));
    } else if (typeof v1Payload.toAddress === 'string') {
      toAddressArray = [cleanEmailAddress(v1Payload.toAddress)];
    } else {
      console.error('Invalid toAddress format:', v1Payload.toAddress);
      toAddressArray = [];
    }

    return {
      messageId: v1Payload.messageId,
      subject: v1Payload.subject,
      fromAddress: cleanEmailAddress(v1Payload.fromAddress),
      fromName: (v1Payload as any).sender || undefined,
      toAddress: toAddressArray,
      ccAddress: v1Payload.ccAddress?.map(email => cleanEmailAddress(email)) || [],
      date: v1Payload.date,
      hasAttachment: v1Payload.hasAttachment,
      attachments: [],
      preview: (v1Payload as any).summary || undefined,
      bodyHtml: (v1Payload as any).html || '',
      bodyText: (v1Payload as any).summary || '',
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
 * Check if email passes trigger filters (simplified - accepts all emails)
 */
function passesFilters(_normalizedPayload: any, _settings: EmailTriggerSettings): { passes: boolean; reason?: string } {
  // Simplified: accept all emails (no filtering)
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
  status: 'processed' | 'filtered' | 'failed' | 'testing',
  reason?: string,
  executionId?: string,
  isTestingMode?: boolean
): Promise<void> {
  const logId = uuidv4();

  const logData: any = {
    id: logId,
    trigger_id: triggerId,
    flow_id: flowId,
    message_id: normalizedPayload.messageId,
    from_address: normalizedPayload.fromAddress,
    subject: normalizedPayload.subject,
    body_text: normalizedPayload.bodyText || normalizedPayload.preview || '',
    body_html: normalizedPayload.bodyHtml || '',
    received_at: Timestamp.now(),
    status,
    created_at: Timestamp.now(),
    is_testing: isTestingMode || false
  };

  // Only add optional fields if they have values
  if (reason) {
    logData.reason = reason;
  }
  if (executionId) {
    logData.execution_id = executionId;
  }

  await goals_db.collection('emailTriggerLogs').doc(logId).set(logData);
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

  // Prepare complete email flow input data
  const emailFlowInput = {
    from_email: normalizedPayload.fromAddress,
    from_name: normalizedPayload.fromName || normalizedPayload.fromAddress,
    to_email: normalizedPayload.toAddress[0], // Primary recipient
    subject: normalizedPayload.subject,
    body_text: normalizedPayload.bodyText || normalizedPayload.preview || '',
    body_html: normalizedPayload.bodyHtml || '',
    received_at: normalizedPayload.date,
    message_id: normalizedPayload.messageId,
    headers: {},
    attachments: normalizedPayload.hasAttachment ? normalizedPayload.attachments : [],
    trigger_email: normalizedPayload.toAddress[0],
    account_id: normalizedPayload.accountId,
    // Add raw normalized payload for complete access
    raw_payload: normalizedPayload,
    // Add trigger type for flow execution context
    trigger_type: 'email'
  };

  // Store email data for flow execution (for backup/retrieval if needed)
  await goals_db.collection('emailFlowInputs').doc(executionId).set({
    execution_id: executionId,
    flow_id: flowId,
    email_data: emailFlowInput,
    created_at: Timestamp.now()
  });

  // Trigger flow execution via QStash with complete email data
  await qstashClient.publishJSON({
    url: API_BASE_URL,
    body: {
      flowId,
      userId,
      executionId,
      triggerData: emailFlowInput // Pass complete email data as triggerData
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

    console.log('Request method:', request.method);
    console.log('Request body:', JSON.stringify(request.body, null, 2));

    // Validate webhook security
    const bodyString = JSON.stringify(request.body);
    if (!validateWebhookSecurity(request.headers, bodyString)) {
      response.status(401).json({ error: 'Unauthorized' });
      return;
    }

    // Parse and normalize webhook payload
    const webhookPayload = request.body as ZohoWebhookPayload;
    console.log('Raw toAddress:', (webhookPayload as any).toAddress, 'Type:', typeof (webhookPayload as any).toAddress);
    const normalizedPayload = normalizeWebhookPayload(webhookPayload);
    console.log('Normalized toAddress:', normalizedPayload.toAddress, 'Type:', typeof normalizedPayload.toAddress);

    console.log('Received email webhook:', {
      messageId: normalizedPayload.messageId,
      from: normalizedPayload.fromAddress,
      to: normalizedPayload.toAddress,
      subject: normalizedPayload.subject
    });

    console.log('Email content debug:', {
      bodyHtmlLength: normalizedPayload.bodyHtml?.length || 0,
      bodyTextLength: normalizedPayload.bodyText?.length || 0,
      previewLength: normalizedPayload.preview?.length || 0,
      hasBodyHtml: !!normalizedPayload.bodyHtml,
      hasBodyText: !!normalizedPayload.bodyText
    });

    console.log('Processing recipients:', normalizedPayload.toAddress);

    // Process each recipient (there might be multiple triggers)
    const results: WebhookProcessingResult[] = [];

    // Check if this is a testing email (contains [TEST] in subject or from a testing tool)
    const isTestingMode = normalizedPayload.subject?.includes('[TEST]') ||
                         normalizedPayload.subject?.includes('Test Email') ||
                         normalizedPayload.fromAddress?.includes('test') ||
                         normalizedPayload.fromAddress?.includes('noreply');

    console.log(`Processing email - Testing mode: ${isTestingMode}`);

    for (const recipientEmail of normalizedPayload.toAddress) {
      console.log(`Processing recipient: "${recipientEmail}"`);
      const triggerId = extractTriggerIdFromEmail(recipientEmail);
      console.log(`Extracted trigger ID: "${triggerId}"`);

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

          // Debug: List all existing triggers to help troubleshoot
          const allTriggers = await goals_db.collection('emailTriggers').limit(10).get();
          console.log('Existing email triggers:');
          allTriggers.docs.forEach(doc => {
            const data = doc.data();
            console.log(`- ID: ${doc.id}, Email: ${data.unique_email}, Status: ${data.status}, FlowID: ${data.flow_id}`);
          });

          // Also check flows collection for this trigger ID pattern
          const flowsWithEmailTrigger = await goals_db.collection('flows')
            .where('trigger.node_id', '==', 'EMAIL_TRIGGER')
            .limit(5)
            .get();
          console.log('Flows with email triggers:');
          flowsWithEmailTrigger.docs.forEach(doc => {
            const data = doc.data();
            const triggerProps = data.trigger?.propsData;
            console.log(`- FlowID: ${doc.id}, Email: ${triggerProps?.unique_email}, TriggerID: ${triggerProps?.trigger_id}, Status: ${data.status}`);
          });

          // For testing mode, log as testing instead of failed
          if (isTestingMode) {
            await logEmailTrigger(triggerId, '', normalizedPayload, 'testing', 'EMAIL_RECEIVED_FOR_TESTING', undefined, true);
          } else {
            await logEmailTrigger(triggerId, '', normalizedPayload, 'failed', 'TRIGGER_NOT_FOUND', undefined, false);
          }
          continue;
        }

        const triggerData = triggerDoc.data() as EmailTrigger;

        // Check if trigger is active
        if (triggerData.status !== 'active') {
          console.log(`Email trigger inactive: ${triggerId}`);
          if (isTestingMode) {
            await logEmailTrigger(triggerId, triggerData.flow_id, normalizedPayload, 'testing', 'EMAIL_RECEIVED_FOR_TESTING', undefined, true);
          } else {
            await logEmailTrigger(triggerId, triggerData.flow_id, normalizedPayload, 'filtered', 'TRIGGER_INACTIVE', undefined, false);
          }
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
          if (isTestingMode) {
            await logEmailTrigger(triggerId, triggerData.flow_id, normalizedPayload, 'testing', 'EMAIL_RECEIVED_FOR_TESTING', undefined, true);
          } else {
            await logEmailTrigger(triggerId, triggerData.flow_id, normalizedPayload, 'filtered', 'FLOW_INACTIVE', undefined, false);
          }
          continue;
        }

        // Track email received event
        const analytics = getAnalytics();
        analytics.trackEmailTriggerEvent('EMAIL_RECEIVED', {
          trigger_id: triggerId,
          flow_id: triggerData.flow_id,
          from_email: normalizedPayload.from,
          subject: normalizedPayload.subject,
          is_testing: isTestingMode
        }, triggerData.creator_id);

        // In testing mode, just log the email reception without executing the flow
        if (isTestingMode) {
          console.log(`Testing mode: Email received for trigger ${triggerId}, skipping flow execution`);
          await logEmailTrigger(triggerId, triggerData.flow_id, normalizedPayload, 'testing', 'EMAIL_RECEIVED_FOR_TESTING', undefined, true);

          results.push({
            triggerId,
            flowId: triggerData.flow_id,
            status: 'testing'
          });
        } else {
          // Execute the flow only in non-testing mode
          const executionId = await executeFlowWithEmailData(
            triggerData.flow_id,
            triggerData.creator_id,
            normalizedPayload
          );

          // Track flow triggered event
          analytics.trackEmailTriggerEvent('FLOW_TRIGGERED', {
            trigger_id: triggerId,
            flow_id: triggerData.flow_id,
            execution_id: executionId,
            trigger_count: (triggerData.trigger_count || 0) + 1
          }, triggerData.creator_id);

          // Update trigger statistics
          await goals_db.collection('emailTriggers').doc(triggerId).update({
            last_triggered: Timestamp.now(),
            trigger_count: (triggerData.trigger_count || 0) + 1
          });

          // Log successful processing
          await logEmailTrigger(triggerId, triggerData.flow_id, normalizedPayload, 'processed', undefined, executionId, false);

          results.push({
            triggerId,
            flowId: triggerData.flow_id,
            executionId,
            status: 'processed'
          });

          console.log(`Successfully triggered flow ${triggerData.flow_id} with execution ID: ${executionId}`);
        }

        // Clean up old logs for this trigger (async, don't wait)
        cleanupLogsForTrigger(triggerId, 24).catch(error => {
          console.warn(`Failed to cleanup logs for trigger ${triggerId}:`, error);
        });

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
