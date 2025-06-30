import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { getAuth } from 'firebase-admin/auth';
import { goalmatic_whatsapp_integration_otp } from '../whatsapp/templates/goalmatic_whatsapp_integration_otp';
import { send_WA_Message } from '../whatsapp/utils/sendMessage';
import { goals_db } from '../init';
import firebaseServer from '../init';
import { normalizePhoneNumber, normalizePhoneForWhatsApp, getPhoneQueryFormats } from '../utils/phoneUtils';

// Initialize Firebase Admin Auth
const auth = getAuth(firebaseServer()!);

// Original function - requires authentication
export const sendWhatsappOTP = onCall(
    {
        cors: true,
        region: 'us-central1',
    },
    async (request) => {
        try {
            if (!request.auth)
                throw new HttpsError('unauthenticated', 'Unauthorized');

            const { phoneNumber } = request.data;
            
            // Normalize phone number
            const normalizedPhone = normalizePhoneNumber(phoneNumber);
            const whatsappPhone = normalizePhoneForWhatsApp(phoneNumber);

            if (!normalizedPhone || !whatsappPhone)
                throw new Error('Invalid phone number format');

            const otp = generateFourDigitOTP();

            const waMsg = goalmatic_whatsapp_integration_otp({
                otp: otp,
                recipientNumber: whatsappPhone,
            });

            try {
                await send_WA_Message(waMsg);
                await goals_db.collection('users').doc(request.auth?.uid!).set({
                    otp: otp,
                    otp_sent_at: new Date().toISOString(),
                }, { merge: true })
                return { code: 200, message: 'OTP sent successfully' };
            } catch (e: any) {
                return { msg: e.response.data, code: 500 };
            }

        } catch (error) {
            throw new HttpsError('internal', `${error}`);
        }
    }
);

// For signup - no authentication required, checks if phone is not already registered
export const sendWhatsappOTPForSignup = onCall(
    {
        cors: true,
        region: 'us-central1',
    },
    async (request) => {
        try {
            const { phoneNumber } = request.data;
            
            // Normalize phone number
            const phoneFormats = getPhoneQueryFormats(phoneNumber);

            if (!phoneFormats.isValid)
                throw new Error('Invalid phone number format');

            // Check if phone number is already registered (normalized format only after migration)
            const existingUser = await goals_db.collection('users')
                .where('phone', '==', phoneFormats.normalized)
                .get();

            if (!existingUser.empty) {
                return { 
                    code: 400, 
                    message: 'This phone number is already registered. Please try logging in instead.' 
                };
            }

            const otp = generateFourDigitOTP();

            const waMsg = goalmatic_whatsapp_integration_otp({
                otp: otp,
                recipientNumber: phoneFormats.whatsapp!, // Use WhatsApp format for sending
            });

            try {
                await send_WA_Message(waMsg);
                
                // Store OTP temporarily for verification (expires in 10 minutes)
                // Use normalized phone as key for consistency
                await goals_db.collection('temp_otps').doc(phoneFormats.normalized!).set({
                    otp: otp,
                    phone: phoneFormats.normalized, // Store normalized format
                    whatsapp_phone: phoneFormats.whatsapp, // Also store WhatsApp format
                    type: 'signup',
                    created_at: new Date(),
                    expires_at: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
                });
                
                return { code: 200, message: 'OTP sent successfully' };
            } catch (e: any) {
                console.error('WhatsApp send error:', e);
                return { msg: e.response?.data || e.message, code: 500 };
            }

        } catch (error) {
            console.error('SendWhatsappOTPForSignup error:', error);
            throw new HttpsError('internal', `${error}`);
        }
    }
);

// For login - no authentication required, checks if phone is registered
export const sendWhatsappOTPForLogin = onCall(
    {
        cors: true,
        region: 'us-central1',
    },
    async (request) => {
        try {
            const { phoneNumber } = request.data;
            
            // Normalize phone number
            const phoneFormats = getPhoneQueryFormats(phoneNumber);

            if (!phoneFormats.isValid)
                throw new Error('Invalid phone number format');

            // Check if phone number is registered (normalized format only after migration)
            const existingUser = await goals_db.collection('users')
                .where('phone', '==', phoneFormats.normalized)
                .get();

            if (existingUser.empty) {
                return { 
                    code: 400, 
                    message: 'No account found with this phone number. Please sign up first.' 
                };
            }

            const userData = existingUser.docs[0].data();

            // Verify user before sending OTP
            try {
                const userId = userData.id;

                // Verify user exists in Firebase Auth
                const userRecord = await auth.getUser(userId);
                
                // Update last login attempt
                await goals_db.collection('users').doc(userId).update({
                    last_login_attempt_at: new Date(),
                    updated_at: new Date(),
                });

                console.log(`User ${userRecord.uid} (${phoneFormats.normalized}) verified for OTP login`);
            } catch (authError) {
                console.error('User verification failed during OTP login:', authError);
                return { 
                    code: 400, 
                    message: 'Account verification failed. Please contact support.' 
                };
            }

            const otp = generateFourDigitOTP();

            const waMsg = goalmatic_whatsapp_integration_otp({
                otp: otp,
                recipientNumber: phoneFormats.whatsapp!, // Use WhatsApp format for sending
            });

            try {
                await send_WA_Message(waMsg);
                
                // Store OTP temporarily for verification (expires in 10 minutes)
                // Use normalized phone as key for consistency
                await goals_db.collection('temp_otps').doc(phoneFormats.normalized!).set({
                    otp: otp,
                    phone: phoneFormats.normalized, // Store normalized format
                    whatsapp_phone: phoneFormats.whatsapp, // Also store WhatsApp format
                    type: 'login',
                    created_at: new Date(),
                    expires_at: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
                });
                
                return { code: 200, message: 'OTP sent successfully' };
            } catch (e: any) {
                console.error('WhatsApp send error:', e);
                return { msg: e.response?.data || e.message, code: 500 };
            }

        } catch (error) {
            console.error('SendWhatsappOTPForLogin error:', error);
            throw new HttpsError('internal', `${error}`);
        }
    }
);

const generateFourDigitOTP = () => {
    return Math.floor(1000 + Math.random() * 9000).toString();
};
