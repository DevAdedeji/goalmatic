import { HttpsError } from "firebase-functions/v2/https";
import {
  createEmailTrigger,
  getEmailTriggerByFlowId,
} from "../../../email/emailTriggerService";
import { goals_db } from "../../../init";
import { Timestamp } from "firebase-admin/firestore";

interface EmailTriggerProps {
  // Unique email address (auto-generated, read-only)
  unique_email?: string;
}

export const handleActivateEmailTrigger = async (
  flowData: any,
  userId: string,
) => {
  try {
    console.log(`Activating email trigger for flow ${flowData.id}, user ${userId}`);
    const { propsData } = flowData.trigger;
    console.log('Trigger propsData:', JSON.stringify(propsData, null, 2));

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

    let emailTrigger: any;

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
      console.log(`Creating email trigger with ID: ${existingTriggerId}`);
      await goals_db
        .collection("emailTriggers")
        .doc(existingTriggerId)
        .set(emailTrigger);
      console.log(`Email trigger saved to database: ${existingTriggerId}`);
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
    console.log(`Trigger ID: ${emailTrigger.id}, Status: ${emailTrigger.status}`);

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
 * Parse and validate email trigger settings from flow props (simplified)
 */
function parseEmailTriggerSettings(_propsData: EmailTriggerProps) {
  // Return empty settings object - defaults will be applied by validateSettings
  return {};
}
