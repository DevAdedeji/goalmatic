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

  const signatureBuffer = Buffer.from(signatureHeader.replace("sha256=", ""), "hex");

  const hmac = crypto.createHmac("sha256", APP_SECRET);
  const digestString = hmac.update(req.rawBody || JSON.stringify(req.body)).digest('hex');
  const digestBuffer = Buffer.from(digestString, "hex");

  if (!crypto.timingSafeEqual(digestBuffer, signatureBuffer)) {
    console.error("Error: Request Signature did not match");
    return false;
  }
  return true;
}


// Function to extract phone number from flow_token
function extractPhoneFromFlowToken(flow_token: string): string | null {
  try {
    // The flow_token should be structured to include phone number
    // Common approaches:
    // 1. JSON string: {"phone": "+1234567890", "session": "uuid"}
    // 2. Delimited string: "phone:+1234567890:session:uuid"
    // 3. Base64 encoded JSON
    
    if (!flow_token) return null;
    
    // Try JSON parsing first
    try {
      const parsed = JSON.parse(flow_token);
      if (parsed.phone) {
        return parsed.phone;
      }
    } catch {
      // Not JSON, try other formats
    }
    
    // Try base64 decoding then JSON parsing
    try {
      const decoded = Buffer.from(flow_token, 'base64').toString('utf-8');
      const parsed = JSON.parse(decoded);
      if (parsed.phone) {
        return parsed.phone;
      }
    } catch {
      // Not base64 JSON
    }
    
    // Try delimited format: phone:+1234567890:session:uuid
    if (flow_token.includes(':')) {
      const parts = flow_token.split(':');
      const phoneIndex = parts.findIndex(part => part === 'phone');
      if (phoneIndex !== -1 && phoneIndex + 1 < parts.length) {
        return parts[phoneIndex + 1];
      }
    }
    
    // Extract phone number using regex as fallback
    const phoneRegex = /(\+?\d{1,4}[-.\s]?\(?\d{1,4}\)?[-.\s]?\d{1,4}[-.\s]?\d{1,4}[-.\s]?\d{1,9})/g;
    const matches = flow_token.match(phoneRegex);
    
    if (matches && matches.length > 0) {
      // Return the first valid phone number found
      for (const match of matches) {
        const cleaned = match.replace(/[-.\s()]/g, '');
        
        // Basic validation: phone number should be 7-15 digits
        if (cleaned.length >= 7 && cleaned.length <= 15) {
          // Ensure it starts with + for international format
          if (cleaned.startsWith('+')) {
            return cleaned;
          } else if (cleaned.match(/^\d+$/)) {
            // If it's all digits, add + prefix
            return `+${cleaned}`;
          }
        }
      }
    }
    
    return null;
  } catch (error) {
    console.warn('Error extracting phone from flow_token:', error);
    return null;
  }
}

export const whatsappFlowDataExchange = onRequest({
    cors: true,
    region: 'us-central1'
}, async (req, res) => { 
    try {
        // Handle GET request - health check
        if (req.method === 'GET') {
            res.status(200).send(`<pre>Nothing to see here.
Checkout README.md to start.</pre>`);
            return;
        }

        // Handle POST request - flow data exchange
        if (req.method === 'POST') {
            if (!WHATSAPP_FLOW_PRIVATE_KEY) {
                console.error('Private key is empty. Please check your env variable "WHATSAPP_FLOW_PRIVATE_KEY".');
                res.status(500).send('Private key not configured');
                return;
            }

            // Validate request signature if APP_SECRET is configured
            if (APP_SECRET && !isRequestSignatureValid(req)) {
                // Return status code 432 if request signature does not match.
                // To learn more about return error codes visit: https://developers.facebook.com/docs/whatsapp/flows/reference/error-codes#endpoint_error_codes
                console.error('Request signature validation failed');
                res.status(432).send();
                return;
            }

            let decryptedRequest;
            try {
                decryptedRequest = decryptRequest(req.body, WHATSAPP_FLOW_PRIVATE_KEY, WHATSAPP_FLOW_PASSPHRASE);
            } catch (err: any) {
                console.error('Decryption failed:', err);
                if (err instanceof FlowEndpointException) {
                    res.status(err.statusCode).send();
                    return;
                }
                // Return 421 for decryption failures to refresh public key
                res.status(421).send();
                return;
            }

            const { aesKeyBuffer, initialVectorBuffer, decryptedBody } = decryptedRequest;
            console.log("💬 Decrypted Request:", JSON.stringify(decryptedBody, null, 2));
            
            console.log("🔍 Raw request body:", JSON.stringify(req.body, null, 2));
            console.log("📋 Decrypted Flow data:", JSON.stringify(decryptedBody, null, 2));
            
            // Extract phone number from flow_token if encoded there
            // This is the recommended approach - encode phone number in flow_token when sending Flow
            let phoneNumber: string | null = null;
            
            try {
                // Try to extract phone number from flow_token
                phoneNumber = extractPhoneFromFlowToken(decryptedBody.flow_token);
                if (phoneNumber) {
                    console.log("📱 Phone number extracted from flow_token:", phoneNumber);
                    decryptedBody.webhook_phone_number = phoneNumber;
                } else {
                    console.warn("❌ No phone number found in flow_token. You need to encode it when sending the Flow message.");
                }
            } catch (error) {
                console.warn("⚠️ Failed to extract phone from flow_token:", error);
            }

            // Process the request and get screen response
            let screenResponse;
            try {
                screenResponse = await getNextScreen(decryptedBody);
                console.log("👉 Response to Encrypt:", JSON.stringify(screenResponse, null, 2));
            } catch (screenError: any) {
                console.error('Screen processing error:', screenError);
                // Return a generic error response
                screenResponse = {
                    data: {
                        error: {
                            message: "An unexpected error occurred",
                            error_messages: ["Please try again or contact support"]
                        }
                    }
                };
            }

            // Encrypt and send response as plain text string
            const encryptedResponse = encryptResponse(screenResponse, aesKeyBuffer, initialVectorBuffer);
            res.status(200).send(encryptedResponse);
            return;
        }

        // Method not allowed
        res.status(405).send('Method Not Allowed');
    } catch (error: any) {
        console.error('WhatsApp Flow Data Exchange Error:', error);
        res.status(500).send('Internal Server Error');
    }
}) 