import { goals_db } from "../init";

type EnsureLabelParams = {
  composio: any;              // Instance of Composio({ apiKey })
  userId: string;             // Composio user id
  connectedAccountId: string; // Composio connected account id
  messageId: string;          // Gmail message id
  labelName: string;          // Label to apply (create if needed)
};

/**
 * Idempotency guard: returns true if messageId has been processed recently.
 * Uses a simple Firestore doc keyed by messageId.
 */
export async function wasProcessedRecently(messageId: string): Promise<boolean> {
  const docRef = goals_db.collection("gmailProcessed").doc(messageId);
  const doc = await docRef.get();
  if (doc.exists) return true;
  await docRef.set({ processed_at: new Date() });
  return false;
}

/**
 * Ensure the label exists and apply it to the message.
 * Uses Composio Gmail toolkit. The tool id GMAIL_PATCH_LABEL is based on Composio docs/tool list.
 * If the tool id differs in your workspace, replace it here and in gmailEventHandler.
 */
export async function ensureLabelAndApplyIfMissing(params: EnsureLabelParams) {
  const { composio, userId, connectedAccountId, messageId, labelName } = params;

  // Attempt to patch labels by name (tool should handle creation-or-use semantics).
  // Fall back or adjust if toolkit expects label ids or a different parameter shape.
  const result = await composio.tools.execute("GMAIL_PATCH_LABEL", {
    userId,
    connectedAccountId,
    arguments: {
      message_id: messageId,
      add_labels: [labelName],
    },
  });

  return result;
}