



import { HttpsError } from "firebase-functions/v2/https";
// @ts-ignore
import { Composio } from "@composio/core";
import { is_dev, goals_db } from "../../../init";

/**
 * Provisional Gmail trigger key per user instruction.
 * Replace with the exact Composio trigger key when confirmed from dashboard.
 */
const GMAIL_TRIGGER_KEY = "GMAIL_NEW_GMAIL_MESSAGE";

type GmailTriggerFilters = {
  sender_contains?: string;
  subject_contains?: string;
};

export const handleActivateGmailTrigger = async (flowData: any, userId: string) => {
  if (!flowData?.id) throw new HttpsError("invalid-argument", "Missing flow id");
  const COMPOSIO_API_KEY = is_dev ? process.env.COMPOSIO_API_KEY_DEV : process.env.COMPOSIO_API_KEY_PROD;
  const BASE_URL = is_dev ? process.env.BASE_URL_DEV : process.env.BASE_URL;
  if (!COMPOSIO_API_KEY) throw new HttpsError("failed-precondition", "Missing COMPOSIO_API_KEY");
  if (!BASE_URL) throw new HttpsError("failed-precondition", "Missing BASE_URL/BASE_URL_DEV");

  // Read optional filters from trigger props
  const filters = (flowData?.trigger?.propsData?.gmail_filters || {}) as GmailTriggerFilters;
  const senderContains = typeof filters.sender_contains === "string" ? filters.sender_contains : undefined;
  const subjectContains = typeof filters.subject_contains === "string" ? filters.subject_contains : undefined;

  // Resolve user's Composio Gmail connection
  const integrations = await goals_db
    .collection("users")
    .doc(userId)
    .collection("integrations")
    .where("type", "==", "EMAIL")
    .where("provider", "==", "GOOGLE_COMPOSIO")
    .get();

  if (integrations.empty) {
    throw new HttpsError(
      "failed-precondition",
      "No Composio Gmail connection found. Connect Gmail first."
    );
  }

  const connectionId = integrations.docs[0].data().connection_id as string;
  const callbackUrl = `${BASE_URL}/composioGmailWebhook`;

  const composio = new Composio({ apiKey: COMPOSIO_API_KEY });

  // Attempt to subscribe using Composio Triggers SDK if available.
  let subscription: any = null;
  try {
    // @ts-ignore - keep compatibility if SDK surface differs
    if (composio?.triggers?.subscribe) {
      // @ts-ignore
      const subscribeFn = (composio as any)?.triggers?.subscribe as any;
      if (typeof subscribeFn === "function") {
        subscription = await subscribeFn({
          trigger: GMAIL_TRIGGER_KEY,
          userId,
          connectedAccountId: connectionId,
          callbackUrl,
          config: {
            sender_contains: senderContains,
            subject_contains: subjectContains,
          },
        });
      }
    }
  } catch (err) {
    console.warn(
      "composio.triggers.subscribe not available or failed; falling back to manual/dashboard registration.",
      err
    );
  }

  const storedSub = {
    id: subscription?.id || `sub_${flowData.id}`,
    trigger_key: GMAIL_TRIGGER_KEY,
    flow_id: flowData.id,
    user_id: userId,
    connected_account_id: connectionId,
    callback_url: callbackUrl,
    config: {
      sender_contains: senderContains,
      subject_contains: subjectContains,
    },
    created_at: new Date().toISOString(),
    // true => enable from Composio Dashboard using the values above
    requires_dashboard_confirmation: !subscription,
  };

  await goals_db.collection("composioGmailTriggers").doc(flowData.id).set(storedSub, { merge: true });

  // Mark flow as active
  await goals_db.collection("flows").doc(flowData.id).update({
    status: 1,
    updated_at: new Date(),
  });

  return {
    success: true,
    message: subscription ? "Gmail trigger subscribed via SDK" : "Gmail trigger prepared; enable in Composio Dashboard if needed",
    subscription: storedSub,
  };
}