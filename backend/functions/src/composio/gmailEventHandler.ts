import { goals_db, is_dev } from "../init";
// @ts-ignore
import { Composio } from "@composio/core";
import { ensureLabelAndApplyIfMissing, wasProcessedRecently } from "./utils";

const COMPOSIO_API_KEY = is_dev ? process.env.COMPOSIO_API_KEY_DEV : process.env.COMPOSIO_API_KEY_PROD;
const DEFAULT_LABEL = process.env.GMAIL_LABEL_TARGET || "GoalMatic";

/**
 * Normalize and process a Composio Gmail event payload.
 * Applies a label to the Gmail message idempotently and logs the result.
 */
export async function gmailEventHandler(payload: any) {
  if (!COMPOSIO_API_KEY) throw new Error("Missing COMPOSIO_API_KEY");
  const composio = new Composio({ apiKey: COMPOSIO_API_KEY });

  // Defensive extraction to handle minor schema variations
  const data = payload?.data || payload?.payload || payload;
  const userId = payload?.userId || payload?.user_id;
  const connectedAccountId = payload?.connectedAccountId || payload?.connected_account_id;
  const messageId = data?.messageId || data?.gmail_message_id || data?.id;
  const threadId = data?.threadId || data?.gmail_thread_id;
  const subject = data?.subject || data?.headers?.Subject || "";
  const from = data?.sender || data?.from || data?.headers?.From || "";
  const to = data?.to || data?.headers?.To || [];
  const receivedAt = data?.messageTimestamp || data?.receivedAt || data?.date || new Date().toISOString();

  if (!userId || !connectedAccountId || !messageId) {
    throw new Error("Missing userId/connectedAccountId/messageId in payload");
  }

  // Idempotency guard by messageId
  const duplicate = await wasProcessedRecently(messageId);
  if (duplicate) return { status: "duplicate", messageId };

  // Ensure label exists and apply it
  const labelName = DEFAULT_LABEL;
  const applyResult = await ensureLabelAndApplyIfMissing({
    composio,
    userId,
    connectedAccountId,
    messageId,
    labelName,
  });

  // Log metadata
  await goals_db.collection("gmailTriggerLogs").add({
    user_id: userId,
    connected_account_id: connectedAccountId,
    message_id: messageId,
    thread_id: threadId,
    subject,
    from,
    to,
    received_at: receivedAt,
    label_applied: labelName,
    applied_result: applyResult,
    created_at: new Date(),
  });

  return { status: "ok", messageId, label: labelName };
}