import { HttpsError } from "firebase-functions/v2/https";
import {
  createEmailTrigger,
  getEmailTriggerByFlowId,
} from "../../../email/emailTriggerService";
import { goals_db } from "../../../init";
import { Timestamp } from "firebase-admin/firestore";

interface EmailTriggerProps {
  // Email filtering settings
  allowed_senders?: string;
  blocked_senders?: string;
  subject_contains?: string;
  subject_excludes?: string;

  // Rate limiting
  max_triggers_per_hour?: number;
  max_triggers_per_day?: number;

  // Processing options
  include_attachments?: boolean;
  max_attachment_size_mb?: number;
  allowed_file_types?: string;

  // Auto-reply
  send_auto_reply?: boolean;
  auto_reply_message?: string;
}

export const handleActivateEmailTrigger = async (
  flowData: any,
  userId: string,
) => {
  try {
    const { propsData } = flowData.trigger;

    // Check if email trigger already exists for this flow
    const existingTrigger = await getEmailTriggerByFlowId(flowData.id, userId);
    if (existingTrigger) {
      // If trigger exists but is inactive, reactivate it
      if (existingTrigger.status === "inactive") {
        await goals_db
          .collection("emailTriggers")
          .doc(existingTrigger.id)
          .update({
            status: "active",
            updated_at: Timestamp.now(),
          });

        // Update flow with existing trigger info
        await goals_db.collection("flows").doc(flowData.id).update({
          status: 1,
          "trigger.propsData.unique_email": existingTrigger.unique_email,
          "trigger.propsData.trigger_id": existingTrigger.id,
          updated_at: Timestamp.now(),
        });

        return {
          success: true,
          message: "Email trigger reactivated successfully",
          unique_email: existingTrigger.unique_email,
          trigger_id: existingTrigger.id,
        };
      } else {
        // Trigger is already active
        return {
          success: true,
          message: "Email trigger is already active",
          unique_email: existingTrigger.unique_email,
          trigger_id: existingTrigger.id,
        };
      }
    }

    // Check if email address already exists in propsData (pre-generated)
    const existingEmail = propsData.unique_email;
    const existingTriggerId = propsData.trigger_id;

    let emailTrigger;

    if (existingEmail && existingTriggerId) {
      // Use existing email address and create trigger with it
      const settings = parseEmailTriggerSettings(
        propsData as EmailTriggerProps,
      );

      emailTrigger = {
        id: existingTriggerId,
        flow_id: flowData.id,
        creator_id: userId,
        unique_email: existingEmail,
        trigger_id: existingTriggerId,
        status: "active" as const,
        settings: settings,
        created_at: Timestamp.now(),
        updated_at: Timestamp.now(),
        trigger_count: 0,
      };

      // Save to database
      await goals_db
        .collection("emailTriggers")
        .doc(existingTriggerId)
        .set(emailTrigger);
    } else {
      // Parse and validate trigger settings from propsData
      const settings = parseEmailTriggerSettings(
        propsData as EmailTriggerProps,
      );

      // Create new email trigger with auto-generated address
      emailTrigger = await createEmailTrigger({
        flowId: flowData.id,
        userId: userId,
        settings: settings,
      });
    }

    // Update flow status to active
    await goals_db.collection("flows").doc(flowData.id).update({
      status: 1,
      updated_at: Timestamp.now(),
    });

    console.log(
      `Email trigger activated for flow ${flowData.id}: ${emailTrigger.unique_email}`,
    );

    return {
      success: true,
      message: "Email trigger activated successfully",
      unique_email: emailTrigger.unique_email,
      trigger_id: emailTrigger.id,
      webhook_info: {
        instructions: "Configure outgoing webhook in Zoho Mail Developer Space",
        webhook_url: `${process.env.BASE_URL || process.env.BASE_URL_DEV}/zohoEmailWebhook`,
        event_type: "email_received",
      },
    };
  } catch (error) {
    console.error("Error activating email trigger:", error);

    if (error instanceof HttpsError) {
      throw error;
    }

    throw new HttpsError(
      "internal",
      `Failed to activate email trigger: ${error instanceof Error ? error.message : "Unknown error"}`,
    );
  }
};

/**
 * Parse and validate email trigger settings from flow props
 */
function parseEmailTriggerSettings(propsData: EmailTriggerProps) {
  const settings: any = {};

  // Parse email lists
  if (propsData.allowed_senders) {
    settings.allowed_senders = propsData.allowed_senders
      .split(",")
      .map((email) => email.trim())
      .filter((email) => email.length > 0);
  }

  if (propsData.blocked_senders) {
    settings.blocked_senders = propsData.blocked_senders
      .split(",")
      .map((email) => email.trim())
      .filter((email) => email.length > 0);
  }

  // Parse subject filters
  if (propsData.subject_contains || propsData.subject_excludes) {
    settings.subject_filters = {};

    if (propsData.subject_contains) {
      settings.subject_filters.include = propsData.subject_contains
        .split(",")
        .map((keyword) => keyword.trim())
        .filter((keyword) => keyword.length > 0);
    }

    if (propsData.subject_excludes) {
      settings.subject_filters.exclude = propsData.subject_excludes
        .split(",")
        .map((keyword) => keyword.trim())
        .filter((keyword) => keyword.length > 0);
    }
  }

  // Parse rate limiting
  if (propsData.max_triggers_per_hour) {
    settings.max_triggers_per_hour = Math.min(
      Math.max(1, parseInt(propsData.max_triggers_per_hour.toString()) || 60),
      1000,
    );
  }

  if (propsData.max_triggers_per_day) {
    settings.max_triggers_per_day = Math.min(
      Math.max(1, parseInt(propsData.max_triggers_per_day.toString()) || 500),
      5000,
    );
  }

  // Parse attachment settings
  if (propsData.include_attachments !== undefined) {
    settings.include_attachments = Boolean(propsData.include_attachments);
  }

  if (propsData.max_attachment_size_mb) {
    settings.max_attachment_size_mb = Math.min(
      Math.max(1, parseInt(propsData.max_attachment_size_mb.toString()) || 10),
      50,
    );
  }

  if (propsData.allowed_file_types) {
    settings.allowed_attachment_types = propsData.allowed_file_types
      .split(",")
      .map((type) => type.trim().toLowerCase())
      .filter((type) => type.length > 0);
  }

  // Parse auto-reply settings
  if (propsData.send_auto_reply !== undefined) {
    settings.send_auto_reply = Boolean(propsData.send_auto_reply);
  }

  if (propsData.auto_reply_message) {
    settings.auto_reply_message = propsData.auto_reply_message.trim();
  }

  return settings;
}
