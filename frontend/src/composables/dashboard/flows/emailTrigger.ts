import { ref } from "vue";
import { callFirebaseFunction } from "@/firebase/functions";
import { useAlert } from "@/composables/core/notification";

export const useEmailTrigger = () => {
  const { openAlert } = useAlert();

  const isGenerating = ref(false);
  const generatedEmail = ref<string | null>(null);

  /**
   * Generate unique email address for a flow
   */
  const generateEmailAddress = async (
    flowId: string,
  ): Promise<string | null> => {
    if (!flowId) {
      openAlert({ type: "ERROR", msg: "Flow ID is required to generate email address" });
      return null;
    }

    try {
      isGenerating.value = true;

      const result = await callFirebaseFunction("generateEmailAddress", {
        flowId,
      }) as any;

      if (result.success) {
        generatedEmail.value = result.unique_email;

        if (result.is_existing) {
          openAlert({ type: "INFO", msg: "Using existing email address for this flow" });
        } else {
          openAlert({ type: "SUCCESS", msg: "Email address generated successfully" });
        }

        return result.unique_email;
      } else {
        openAlert({ type: "ERROR", msg: "Failed to generate email address" });
        return null;
      }
    } catch (error: any) {
      console.error("Error generating email address:", error);
      openAlert({ type: "ERROR", msg: error.message || "Failed to generate email address" });
      return null;
    } finally {
      isGenerating.value = false;
    }
  };

  /**
   * Copy email address to clipboard
   */
  const copyEmailToClipboard = async (email: string): Promise<boolean> => {
    if (!email) {
      openAlert({ type: "ERROR", msg: "No email address to copy" });
      return false;
    }

    try {
      await navigator.clipboard.writeText(email);
      openAlert({ type: "SUCCESS", msg: "Email address copied to clipboard" });
      return true;
    } catch (error) {
      console.error("Error copying to clipboard:", error);

      // Fallback for older browsers
      try {
        const textArea = document.createElement("textarea");
        textArea.value = email;
        textArea.style.position = "fixed";
        textArea.style.left = "-999999px";
        textArea.style.top = "-999999px";
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand("copy");
        document.body.removeChild(textArea);
        openAlert({ type: "SUCCESS", msg: "Email address copied to clipboard" });
        return true;
      } catch (fallbackError) {
        openAlert({ type: "ERROR", msg: "Failed to copy email address to clipboard" });
        return false;
      }
    }
  };

  /**
   * Validate email address format
   */
  const isValidEmailAddress = (email: string): boolean => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
  };

  /**
   * Extract trigger ID from email address
   */
  const extractTriggerIdFromEmail = (email: string): string | null => {
    const match = email.match(/^([a-zA-Z0-9]+)@goalmatic\.io$/);
    return match ? match[1] : null;
  };

  /**
   * Format email address display
   */
  const formatEmailDisplay = (email: string): string => {
    if (!email) return "Not generated";
    return email;
  };

  /**
   * Get email address status
   */
  const getEmailStatus = (
    email: string | null,
  ): "not-generated" | "generated" | "invalid" => {
    if (!email) return "not-generated";
    if (!isValidEmailAddress(email)) return "invalid";
    return "generated";
  };

  /**
   * Get email address display color based on status
   */
  const getEmailStatusColor = (
    status: "not-generated" | "generated" | "invalid",
  ): string => {
    switch (status) {
      case "not-generated":
        return "text-gray-500";
      case "generated":
        return "text-green-600";
      case "invalid":
        return "text-red-600";
      default:
        return "text-gray-500";
    }
  };

  /**
   * Reset state
   */
  const reset = () => {
    isGenerating.value = false;
    generatedEmail.value = null;
  };

  return {
    // State
    isGenerating,
    generatedEmail,

    // Methods
    generateEmailAddress,
    copyEmailToClipboard,
    isValidEmailAddress,
    extractTriggerIdFromEmail,
    formatEmailDisplay,
    getEmailStatus,
    getEmailStatusColor,
    reset,
  };
};
