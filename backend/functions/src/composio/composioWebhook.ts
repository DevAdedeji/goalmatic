import { onRequest } from 'firebase-functions/v2/https';
import { gmailEventHandler } from './gmailEventHandler';

/**
 * Generic Composio webhook endpoint routed for Gmail events.
 * Later we can add signature verification once the signing scheme is confirmed.
 */
export const composioGmailWebhook = onRequest(
  {
    cors: true,
    region: 'us-central1',
  },
  async (req, res) => {
    try {
      if (req.method !== 'POST') {
        res.status(405).send('Method not allowed');
        return;
      }

      // Optional: verify signature when COMPOSIO_WEBHOOK_SECRET is enabled
      // const verified = verifyComposioSignature(req);
      // if (!verified) {
      //   res.status(401).send('Invalid signature');
      //   return;
      // }

      const body = (req as any).body || {};
      const eventKey = body?.event || body?.type || body?.trigger;

      // Only process Gmail-triggered events for now
      if (!eventKey || String(eventKey).indexOf('GMAIL') === -1) {
        res.status(200).json({ ok: true, ignored: true });
        return;
      }

      const result = await gmailEventHandler(body);
      res.status(200).json({ ok: true, result });
    } catch (err: any) {
      console.error('Composio webhook error:', err);
      res.status(500).json({ ok: false, error: err?.message || 'Internal error' });
    }
  }
);