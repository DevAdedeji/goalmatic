import { HttpsError } from "firebase-functions/v2/https";
import {
  createEmailTrigger,
  getEmailTriggerByFlowId,
  checkEmailExists,
} from "../../../email/emailTriggerService";
import { goals_db } from "../../../init";
import { Timestamp } from "firebase-admin/firestore";

interface EmailTriggerProps {
  // Unique email address (auto-generated, read-only)
  email?: string;
}


const validateEmailTriggerData = async (flowData: any, userId: string): Promise<{ success: boolean, message: string }> => {

  if (!flowData || !flowData.trigger || !flowData.trigger.propsData || !userId) {
    return { success: false, message: 'Invalid flow data' }
  }

  // Validate email format if provided
  const email = flowData.trigger.propsData.email;
  if (email !== null && email !== undefined) {
    if (typeof email !== 'string') {return { success: false, message: 'Email must be a string' }}
    if (email.trim() === '') { return { success: false, message: 'Email cannot be empty' } }
    // Basic email validation regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {return { success: false, message: 'Invalid email format' }}

  }



  return {
    success: true,
    message: 'Validation successful',
  };
}

export const handleActivateEmailTrigger = async (
  flowData: any,
  userId: string,
) => {
  try {
    const { success, message } = await validateEmailTriggerData(flowData, userId);
    if (!success) {
      throw new HttpsError('invalid-argument', message);
    }

    const { propsData } = flowData.trigger;
    console.log('Trigger propsData:', JSON.stringify(propsData, null, 2));

    // Check if email trigger already exists for this flow
    const existingTrigger = await getEmailTriggerByFlowId(flowData.id, userId);
    if (existingTrigger) {
      // If trigger exists but is inactive, reactivate it
      if (existingTrigger.status === 0) {
        await goals_db
          .collection("emailTriggers")
          .doc(existingTrigger.id)
          .update({
            status: 1, // active
            updated_at: Timestamp.now(),
          });

        // Update flow with existing trigger info
        await goals_db.collection("flows").doc(flowData.id).update({
          status: 1,
          "trigger.propsData.email": existingTrigger.email,
          updated_at: Timestamp.now(),
        });

        return {
          success: true,
          message: "Email trigger reactivated successfully",
          email: existingTrigger.email,
        };
      } else {
        // Trigger is already active
        return {
          success: true,
          message: "Email trigger is already active",
          email: existingTrigger.email,
        };
      }
    }

    // Check if email address already exists in propsData (pre-generated)
    const existingEmail = propsData.email;

    let emailTrigger: any;

    if (existingEmail) {
      // Check if the existing email is already in use by another flow
      const emailExists = await checkEmailExists(existingEmail);
      if (emailExists) {
        // Check if it's not the same trigger (to allow reactivation)
        const existingTrigger = await getEmailTriggerByFlowId(flowData.id, userId);
        if (!existingTrigger || existingTrigger.email !== existingEmail) {
          throw new HttpsError(
            "already-exists",
            `Email address ${existingEmail} is already in use by another flow. Please use a different email address.`
          );
        }
      }

      // Extract trigger ID from email address
      const triggerIdFromEmail = existingEmail.split('@')[0];

      // Use existing email address and create trigger with it
      const settings = parseEmailTriggerSettings(
        propsData as EmailTriggerProps,
      );

      emailTrigger = {
        id: triggerIdFromEmail,
        flow_id: flowData.id,
        creator_id: userId,
        email: existingEmail,
        status: 1, // active
        settings: settings,
        created_at: Timestamp.now(),
        updated_at: Timestamp.now(),
        trigger_count: 0,
      };

      // Save to database
      console.log(`Creating email trigger with ID: ${triggerIdFromEmail}`);
      await goals_db
        .collection("emailTriggers")
        .doc(triggerIdFromEmail)
        .set(emailTrigger);
      console.log(`Email trigger saved to database: ${triggerIdFromEmail}`);
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
      `Email trigger activated for flow ${flowData.id}: ${emailTrigger.email}`,
    );
    console.log(`Trigger ID: ${emailTrigger.id}, Status: ${emailTrigger.status}`);

    return {
      success: true,
      message: "Email trigger activated successfully",
      email: emailTrigger.email,
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
