import { goals_db } from '../init';
import { notifyUser } from './emailNotifier';
import { v4 as uuidv4 } from 'uuid';
import { send_WA_ImageMessageInput, send_WA_Message } from '../whatsapp/utils/sendMessage';
import { goalmatic_whatsapp_workflow_template } from '../whatsapp/templates/workflow';
import { formatTemplateMessage } from '../whatsapp/utils/formatTemplateMessage';
import { normalizePhoneForWhatsApp } from '../utils/phoneUtils';

type NotifyParams = {
  userId: string;
  flowId: string;
  executionId?: string;
  errorMessage: string;
  flowName?: string;
  nodeName?: string;
};

export const notifyUserOnFlowFailure = async ({ userId, flowId, errorMessage, flowName, nodeName }: NotifyParams) => {
  const flowLabel = flowName || flowId;
  const message = nodeName
    ? `Your flow "${flowLabel}" failed at "${nodeName}". Error: ${errorMessage}.`
    : `Your flow "${flowLabel}" failed. Error: ${errorMessage}.`;

  try {
    // Try WhatsApp first if user has integration
    const integrationsSnap = await goals_db
      .collection('users')
      .doc(userId)
      .collection('integrations')
      .where('provider', '==', 'WHATSAPP')
      .limit(1)
      .get();

    if (!integrationsSnap.empty) {
      const phone = integrationsSnap.docs[0].data().phone as string | undefined;
      if (phone) {
        const recipient = normalizePhoneForWhatsApp(phone);
        if (recipient) {
          const cswOpen = await isCustomerServiceWindowOpen(recipient);
          try {
            if (cswOpen) {
              const waMsg = send_WA_ImageMessageInput(recipient, message);
              await send_WA_Message(waMsg);
              return true;
            } else {
              const uniqueTemplateMessageId = uuidv4();
              const waMsg = goalmatic_whatsapp_workflow_template({
                message: formatTemplateMessage(message),
                recipientNumber: recipient,
                uniqueTemplateMessageId,
              });
              await send_WA_Message(waMsg);
              return true;
            }
          } catch (waError) {
            // Fall through to email if WhatsApp fails
            console.error('Failed to send WhatsApp failure notification:', waError);
          }
        }
      }
    }

    // Fallback to email
    const userDoc = await goals_db.collection('users').doc(userId).get();
    const userEmail = userDoc.exists ? (userDoc.data()?.email as string | undefined) : undefined;
    if (userEmail) {
      await notifyUser({
        to: [{ email: userEmail, name: userEmail }],
        from: { email: 'noreply@goalmatic.io', name: 'Goalmatic' },
        subject: `Flow failed: ${flowLabel}`,
        message_body: {
          type: 'text/plain',
          value: message,
        },
      });
      return true;
    }

    return false;
  } catch (error) {
    console.error('Error notifying user of flow failure:', error);
    return false;
  }
};

const isCustomerServiceWindowOpen = async (phoneNumber: string) => {
  const cswSnap = await goals_db.collection('CSW').doc(phoneNumber).get();
  if (!cswSnap.exists) return false;
  const cswData = cswSnap.data();
  const lastReceivedMessage = cswData?.lastReceivedMessage;
  if (!lastReceivedMessage) return false;
  const now = new Date();
  const timeSinceLastMessage = now.getTime() - new Date(lastReceivedMessage).getTime();
  return timeSinceLastMessage < 1000 * 60 * 60 * 24; // 24h window
};

