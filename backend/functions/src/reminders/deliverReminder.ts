import { onRequest } from 'firebase-functions/v2/https';
import { goals_db } from '../init';
import { send_WA_Message, send_WA_ImageMessageInput } from '../whatsapp/utils/sendMessage';
import { goalmatic_whatsapp_workflow_template } from '../whatsapp/templates/workflow';
import { formatTemplateMessage } from '../whatsapp/utils/formatTemplateMessage';
import { notifyUser } from '../helpers/emailNotifier';
// import { is_emulator } from '../init';

type DeliveryMethod = 'WHATSAPP' | 'EMAIL';

export const deliverReminder = onRequest({ cors: true, region: 'us-central1' }, async (req, res) => {
    if (req.method !== 'POST') {
        res.status(405).send('Method not allowed');
        return;
    }

    try {
        const { reminderId, userId, deliveryMethod, message } = req.body as {
            reminderId: string;
            userId: string;
            deliveryMethod: DeliveryMethod;
            message: string;
        };

        if (!reminderId || !userId || !deliveryMethod || !message) {
            res.status(400).json({ error: 'Missing required fields' });
            return;
        }

        let delivered = false;
        let channel = deliveryMethod;

        if (deliveryMethod === 'WHATSAPP') {
            // Lookup user's WhatsApp integration phone
            const integrationsSnap = await goals_db
                .collection('users')
                .doc(userId)
                .collection('integrations')
                .where('provider', '==', 'WHATSAPP')
                .limit(1)
                .get();

            if (!integrationsSnap.empty) {
                const phone = integrationsSnap.docs[0].data().phone;
                if (phone) {
                    const cswOpen = await isCustomerServiceWindowOpen(phone);
                    if (cswOpen) {
                        const waMsg = send_WA_ImageMessageInput(phone, message);
                        await send_WA_Message(waMsg);
                        delivered = true;
                    } else {
                        const waMsg = goalmatic_whatsapp_workflow_template({
                            message: formatTemplateMessage(message),
                            recipientNumber: phone,
                            uniqueTemplateMessageId: reminderId,
                        });
                        await send_WA_Message(waMsg);
                        delivered = true;
                    }
                }
            }
        }

        if (!delivered && deliveryMethod === 'EMAIL') {
            // Fallback or requested email
            const userDoc = await goals_db.collection('users').doc(userId).get();
            const userEmail = userDoc.data()?.email;
            if (userEmail) {
                await notifyUser({
                    to: [{ email: userEmail, name: userEmail }],
                    from: { email: 'noreply@goalmatic.io', name: 'Goalmatic' },
                    subject: 'Reminder',
                    message_body: { type: 'text/plain', value: message },
                });
                delivered = true;
            }
        }

        // Update reminder status
        try {
            await goals_db
                .collection('users')
                .doc(userId)
                .collection('reminders')
                .doc(reminderId)
                .set(
                    {
                        status: delivered ? 'delivered' : 'failed',
                        delivered_at: new Date().toISOString(),
                        channel,
                    },
                    { merge: true },
                );
        } catch { }

        res.json({ success: delivered });
    } catch (err: any) {
        res.status(500).json({ error: err?.message || 'Unknown error' });
    }
});

const isCustomerServiceWindowOpen = async (phoneNumber: string) => {
    // if (is_emulator) return true;
    const cswSnap = await goals_db.collection('CSW').doc(phoneNumber).get();
    if (!cswSnap.exists) return false;
    const last = cswSnap.data()?.lastReceivedMessage;
    if (!last) return false;
    return Date.now() - new Date(last).getTime() < 1000 * 60 * 60 * 24;
};

