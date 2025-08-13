export * from "./whatsapp/webhook";
export * from "./whatsapp/flowDataExchange";
export * from "./whatsapp/cleanup";
export * from "./agents/messageAgent";
export * from "./auth/sendWhatsappOTP";
export * from "./auth/verifyWhatsappOTPAndCreateAccount";
export * from "./auth/verifyWhatsappOTPAndLogin";
export * from "./users/index";
export * from "./flows/index";
export * from "./flows/testNode";
export * from "./tables/cloneTable";
export * from "./tables/onRecordDeleted";
export * from "./agents/getAgentDetails";
export * from "./flows/getFlowDetails";
export * from "./ai/tools/generateCron";
export * from "./ai/tools/generateTableFields";
export * from "./reminders/deliverReminder";
export * from "./assistant/generateMediaUrls";
export * from "./referrals/getReferralStats";
export * from "./referrals/processReferralEarnings";
export * from "./referrals/applyReferralDiscount";
export * from "./users/onCreated";
export * from "./chat/deleteChatSession";
export * from "./chat/shareChatSession";

// Composio Gmail integration
export * from "./ai/tools/gmail/utils/setup";

// Convex sync functions
// export * from "./convex/index";
export * from "./agents/migrateAgents";
export * from "./agents/searchAgents";

// Email trigger functions
export * from "./email/zohoWebhookHandler";
export * from "./email/generateEmailAddress";
export * from "./email/cleanupEmailTriggerLogs";

// Debug functions
export * from "./debug/testEmailTrigger";

// Conditionally register Convex sync functions
// We only attach these exports when Convex sync is enabled to avoid
// Firestore trigger registration (and noisy emulator logs) in dev.
import { isConvexSyncEnabled } from "./init";

if (isConvexSyncEnabled()) {
    Object.assign(exports, require("./convex/index"));
}
