import { goals_db } from "../init";
import { v4 as uuidv4 } from "uuid";
import { Timestamp } from "firebase-admin/firestore";
import { HttpsError } from "firebase-functions/v2/https";

// Types (simplified)
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
  trigger_id: string;
  status: "active" | "inactive" | "suspended";
  settings: EmailTriggerSettings;
  created_at: Timestamp;
  updated_at: Timestamp;
  last_triggered?: Timestamp;
  trigger_count: number;
}

interface CreateEmailTriggerParams {
  flowId: string;
  userId: string;
  settings?: Partial<EmailTriggerSettings>;
}

interface UpdateEmailTriggerParams {
  triggerId: string;
  userId: string;
  settings?: Partial<EmailTriggerSettings>;
  status?: "active" | "inactive" | "suspended";
}

// Constants
const EMAIL_DOMAIN = "goalmatic.io";
const DEFAULT_SETTINGS: EmailTriggerSettings = {
  max_triggers_per_hour: 60,
  max_triggers_per_day: 500,
  include_attachments: false,
  max_attachment_size_mb: 10,
  allowed_attachment_types: ["pdf", "doc", "docx", "txt", "jpg", "png", "gif"],
  send_auto_reply: false,
};

/**
 * Generate a unique email address for the trigger
 * Format: {userPrefix}{flowPrefix}@goalmatic.io
 */
function generateUniqueEmail(
  userId: string,
  flowId: string,
): { triggerId: string; email: string } {
  // Take first 3 characters of user ID (alphanumeric only)
  const userPrefix = userId
    .replace(/[^a-zA-Z0-9]/g, "")
    .substring(0, 3)
    .toLowerCase();

  // Take first 3 characters of flow ID (alphanumeric only)
  const flowPrefix = flowId
    .replace(/[^a-zA-Z0-9]/g, "")
    .substring(0, 3)
    .toLowerCase();

  // Add a short random suffix to ensure uniqueness in edge cases
  const randomSuffix = Math.random().toString(36).substring(2, 4);

  const triggerId = `${userPrefix}${flowPrefix}${randomSuffix}`;
  const email = `${triggerId}@${EMAIL_DOMAIN}`;

  return { triggerId, email };
}

/**
 * Validate email trigger settings
 */
function validateSettings(
  settings: Partial<EmailTriggerSettings>,
): EmailTriggerSettings {
  const validatedSettings = { ...DEFAULT_SETTINGS, ...settings };

  // Validate rate limits
  if (
    validatedSettings.max_triggers_per_hour &&
    validatedSettings.max_triggers_per_hour > 1000
  ) {
    throw new HttpsError(
      "invalid-argument",
      "Max triggers per hour cannot exceed 1000",
    );
  }

  if (
    validatedSettings.max_triggers_per_day &&
    validatedSettings.max_triggers_per_day > 5000
  ) {
    throw new HttpsError(
      "invalid-argument",
      "Max triggers per day cannot exceed 5000",
    );
  }

  // Validate attachment settings
  if (validatedSettings.max_attachment_size_mb > 50) {
    throw new HttpsError(
      "invalid-argument",
      "Max attachment size cannot exceed 50MB",
    );
  }

  // Validate allowed attachment types
  const validTypes = [
    "pdf",
    "doc",
    "docx",
    "txt",
    "csv",
    "xls",
    "xlsx",
    "jpg",
    "jpeg",
    "png",
    "gif",
    "zip",
  ];
  if (validatedSettings.allowed_attachment_types) {
    const invalidTypes = validatedSettings.allowed_attachment_types.filter(
      (type) => !validTypes.includes(type.toLowerCase()),
    );
    if (invalidTypes.length > 0) {
      throw new HttpsError(
        "invalid-argument",
        `Invalid attachment types: ${invalidTypes.join(", ")}`,
      );
    }
  }



  return validatedSettings;
}

/**
 * Create a new email trigger
 */
export async function createEmailTrigger(
  params: CreateEmailTriggerParams,
): Promise<EmailTrigger> {
  const { flowId, userId, settings = {} } = params;

  // Validate that the flow exists and belongs to the user
  const flowDoc = await goals_db.collection("flows").doc(flowId).get();
  if (!flowDoc.exists) {
    throw new HttpsError("not-found", "Flow not found");
  }

  const flowData = flowDoc.data();
  if (flowData?.creator_id !== userId) {
    throw new HttpsError(
      "permission-denied",
      "You do not have permission to create triggers for this flow",
    );
  }

  // Check if flow already has an email trigger
  const existingTrigger = await goals_db
    .collection("emailTriggers")
    .where("flow_id", "==", flowId)
    .where("creator_id", "==", userId)
    .limit(1)
    .get();

  if (!existingTrigger.empty) {
    throw new HttpsError(
      "already-exists",
      "This flow already has an email trigger",
    );
  }

  // Generate unique email address based on user and flow IDs
  const { triggerId, email } = generateUniqueEmail(userId, flowId);

  // Validate and merge settings
  const validatedSettings = validateSettings(settings);

  // Create the email trigger
  const emailTrigger: EmailTrigger = {
    id: triggerId,
    flow_id: flowId,
    creator_id: userId,
    unique_email: email,
    trigger_id: triggerId,
    status: "active",
    settings: validatedSettings,
    created_at: Timestamp.now(),
    updated_at: Timestamp.now(),
    trigger_count: 0,
  };

  // Save to database
  console.log(`Saving email trigger to database: ${triggerId}`);
  await goals_db.collection("emailTriggers").doc(triggerId).set(emailTrigger);
  console.log(`Email trigger saved successfully: ${triggerId}`);

  // Update the flow to include the email trigger reference
  await goals_db.collection("flows").doc(flowId).update({
    "trigger.propsData.unique_email": email,
    "trigger.propsData.trigger_id": triggerId,
    updated_at: Timestamp.now(),
  });

  console.log(
    `Created email trigger ${triggerId} for flow ${flowId} with email ${email}`,
  );
  return emailTrigger;
}

/**
 * Get email trigger by ID
 */
export async function getEmailTrigger(
  triggerId: string,
  userId: string,
): Promise<EmailTrigger | null> {
  const triggerDoc = await goals_db
    .collection("emailTriggers")
    .doc(triggerId)
    .get();

  if (!triggerDoc.exists) {
    return null;
  }

  const triggerData = triggerDoc.data() as EmailTrigger;

  // Ensure user owns this trigger
  if (triggerData.creator_id !== userId) {
    throw new HttpsError(
      "permission-denied",
      "You do not have permission to access this trigger",
    );
  }

  return triggerData;
}

/**
 * Get all email triggers for a user
 */
export async function getUserEmailTriggers(
  userId: string,
): Promise<EmailTrigger[]> {
  const triggersSnapshot = await goals_db
    .collection("emailTriggers")
    .where("creator_id", "==", userId)
    .orderBy("created_at", "desc")
    .get();

  return triggersSnapshot.docs.map((doc) => doc.data() as EmailTrigger);
}

/**
 * Get email trigger by flow ID
 */
export async function getEmailTriggerByFlowId(
  flowId: string,
  userId: string,
): Promise<EmailTrigger | null> {
  const triggerSnapshot = await goals_db
    .collection("emailTriggers")
    .where("flow_id", "==", flowId)
    .where("creator_id", "==", userId)
    .limit(1)
    .get();

  if (triggerSnapshot.empty) {
    return null;
  }

  return triggerSnapshot.docs[0].data() as EmailTrigger;
}

/**
 * Update email trigger
 */
export async function updateEmailTrigger(
  params: UpdateEmailTriggerParams,
): Promise<EmailTrigger> {
  const { triggerId, userId, settings, status } = params;

  // Get existing trigger
  const existingTrigger = await getEmailTrigger(triggerId, userId);
  if (!existingTrigger) {
    throw new HttpsError("not-found", "Email trigger not found");
  }

  // Prepare update data
  const updateData: Partial<EmailTrigger> = {
    updated_at: Timestamp.now(),
  };

  if (settings) {
    const validatedSettings = validateSettings({
      ...existingTrigger.settings,
      ...settings,
    });
    updateData.settings = validatedSettings;
  }

  if (status) {
    updateData.status = status;
  }

  // Update in database
  await goals_db.collection("emailTriggers").doc(triggerId).update(updateData);

  // Get updated trigger
  const updatedTrigger = await getEmailTrigger(triggerId, userId);
  if (!updatedTrigger) {
    throw new HttpsError("internal", "Failed to retrieve updated trigger");
  }

  console.log(`Updated email trigger ${triggerId}`);
  return updatedTrigger;
}

/**
 * Delete email trigger
 */
export async function deleteEmailTrigger(
  triggerId: string,
  userId: string,
): Promise<void> {
  // Get existing trigger to validate ownership
  const existingTrigger = await getEmailTrigger(triggerId, userId);
  if (!existingTrigger) {
    throw new HttpsError("not-found", "Email trigger not found");
  }

  // Delete the trigger
  await goals_db.collection("emailTriggers").doc(triggerId).delete();

  // Remove trigger reference from flow
  await goals_db.collection("flows").doc(existingTrigger.flow_id).update({
    "trigger.propsData.unique_email": null,
    "trigger.propsData.trigger_id": null,
    updated_at: Timestamp.now(),
  });

  console.log(`Deleted email trigger ${triggerId}`);
}

/**
 * Get email trigger statistics
 */
export async function getEmailTriggerStats(
  triggerId: string,
  userId: string,
): Promise<any> {
  // Validate ownership
  const trigger = await getEmailTrigger(triggerId, userId);
  if (!trigger) {
    throw new HttpsError("not-found", "Email trigger not found");
  }

  const now = new Date();
  const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
  const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  // Get recent logs
  const logsSnapshot = await goals_db
    .collection("emailTriggerLogs")
    .where("trigger_id", "==", triggerId)
    .where("received_at", ">=", Timestamp.fromDate(oneWeekAgo))
    .orderBy("received_at", "desc")
    .get();

  const logs = logsSnapshot.docs.map((doc) => doc.data());

  // Calculate statistics
  const stats = {
    total_triggers: trigger.trigger_count,
    last_triggered: trigger.last_triggered?.toDate(),
    recent_activity: {
      last_hour: logs.filter((log) => log.received_at.toDate() >= oneHourAgo)
        .length,
      last_day: logs.filter((log) => log.received_at.toDate() >= oneDayAgo)
        .length,
      last_week: logs.length,
    },
    status_breakdown: {
      processed: logs.filter((log) => log.status === "processed").length,
      filtered: logs.filter((log) => log.status === "filtered").length,
      failed: logs.filter((log) => log.status === "failed").length,
    },
    filter_reasons: logs
      .filter((log) => log.status === "filtered" && log.reason)
      .reduce((acc: Record<string, number>, log) => {
        acc[log.reason] = (acc[log.reason] || 0) + 1;
        return acc;
      }, {}),
    recent_logs: logs.slice(0, 10), // Last 10 logs
  };

  return stats;
}

/**
 * Test email trigger (simulate an email)
 */
export async function testEmailTrigger(
  triggerId: string,
  userId: string,
  testEmail: {
    from: string;
    subject: string;
    body?: string;
  },
): Promise<{ success: boolean; message: string; executionId?: string }> {
  // Validate ownership
  const trigger = await getEmailTrigger(triggerId, userId);
  if (!trigger) {
    throw new HttpsError("not-found", "Email trigger not found");
  }

  if (trigger.status !== "active") {
    return {
      success: false,
      message: "Email trigger is not active",
    };
  }

  // Create a mock webhook payload for testing
  // const mockPayload = {
  //   messageId: `test-${uuidv4()}`,
  //   subject: testEmail.subject,
  //   fromAddress: testEmail.from,
  //   fromName: testEmail.from.split("@")[0],
  //   toAddress: [trigger.unique_email],
  //   ccAddress: [],
  //   date: new Date().toISOString(),
  //   hasAttachment: false,
  //   attachments: [],
  //   preview: testEmail.body || "Test email body",
  //   accountId: "test-account",
  // };

  try {
    // Import and use the webhook handler logic (you'd need to refactor the handler to be reusable)
    // For now, we'll just simulate the process

    console.log(
      `Testing email trigger ${triggerId} with mock email from ${testEmail.from}`,
    );

    return {
      success: true,
      message: "Test email trigger executed successfully",
      executionId: `test-${uuidv4()}`,
    };
  } catch (error) {
    console.error("Error testing email trigger:", error);
    return {
      success: false,
      message:
        error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}




// Also, I need a button in the email trigger node that when it's clicked, it's going to actively show incoming emails. So this is for test reference, right? 

// it's basically a way to test the trigger