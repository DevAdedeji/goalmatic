import { onRequest } from 'firebase-functions/v2/https'
import * as crypto from 'crypto'
import { decryptRequest, encryptResponse, FlowEndpointException } from "./utils/encryption";
import { getNextScreen } from "./utils/flows/signup";



// WhatsApp Flow private key - this should be stored in environment variables
// Format: PEM format RSA private key (including -----BEGIN RSA PRIVATE KEY----- headers)
// Generate using: openssl genrsa -out private_key.pem 2048
const WHATSAPP_FLOW_PRIVATE_KEY = process.env.WHATSAPP_FLOW_PRIVATE_KEY || ''
const WHATSAPP_FLOW_PASSPHRASE = process.env.WHATSAPP_FLOW_PASSPHRASE || '' 
const APP_SECRET = process.env.WHATSAPP_APP_SECRET || ''

// Function to validate request signature
function isRequestSignatureValid(req: any): boolean {

  const signatureHeader = req.get("x-hub-signature-256");
  if (!signatureHeader) {
    console.error("Error: No signature header found");
    return false;
  }

  const signatureBuffer = Buffer.from(signatureHeader.replace("sha256=", ""), "utf-8");

  const hmac = crypto.createHmac("sha256", APP_SECRET);
  const digestString = hmac.update(req.rawBody || JSON.stringify(req.body)).digest('hex');
  const digestBuffer = Buffer.from(digestString, "utf-8");

  if (!crypto.timingSafeEqual(digestBuffer, signatureBuffer)) {
    console.error("Error: Request Signature did not match");
    return false;
  }
  return true;
}

export const whatsappFlowDataExchange = onRequest({
    cors: true,
    region: 'us-central1'
}, async (req, res) => { 
    try {
        // Handle GET request - health check
        if (req.method === 'GET') {
            res.send(`<pre>Nothing to see here.
Checkout README.md to start.</pre>`);
            return;
        }

        // Handle POST request - flow data exchange
        if (req.method === 'POST') {
            if (!WHATSAPP_FLOW_PRIVATE_KEY) {
                throw new Error(
                    'Private key is empty. Please check your env variable "WHATSAPP_FLOW_PRIVATE_KEY".'
                );
            }

            // Validate request signature
            if (!isRequestSignatureValid(req)) {
                // Return status code 432 if request signature does not match.
                // To learn more about return error codes visit: https://developers.facebook.com/docs/whatsapp/flows/reference/error-codes#endpoint_error_codes
                res.status(432).send();
                return;
            }

            let decryptedRequest;
            try {
                decryptedRequest = decryptRequest(req.body, WHATSAPP_FLOW_PRIVATE_KEY, WHATSAPP_FLOW_PASSPHRASE);
            } catch (err: any) {
                console.error(err);
                if (err instanceof FlowEndpointException) {
                    res.status(err.statusCode).send();
                    return;
                }
                res.status(500).send();
                return;
            }

            const { aesKeyBuffer, initialVectorBuffer, decryptedBody } = decryptedRequest;
            console.log("💬 Decrypted Request:", decryptedBody);

            // TODO: Uncomment this block and add your flow token validation logic.
            // If the flow token becomes invalid, return HTTP code 427 to disable the flow and show the message in `error_msg` to the user
            // Refer to the docs for details https://developers.facebook.com/docs/whatsapp/flows/reference/error-codes#endpoint_error_codes

            /*
            if (!isValidFlowToken(decryptedBody.flow_token)) {
                const error_response = {
                    error_msg: `The message is no longer available`,
                };
                res
                    .status(427)
                    .send(
                        encryptResponse(error_response, aesKeyBuffer, initialVectorBuffer)
                    );
                return;
            }
            */

            const screenResponse = await getNextScreen(decryptedBody);
            console.log("👉 Response to Encrypt:", screenResponse);

            res.send(encryptResponse(screenResponse, aesKeyBuffer, initialVectorBuffer));
            return;
        }

        // Method not allowed
        res.status(405).send('Method Not Allowed');
    } catch (error: any) {
        console.error('WhatsApp Flow Data Exchange Error:', error);
        res.status(500).send('Internal Server Error');
    }
})