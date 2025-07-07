import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { getAuth } from 'firebase-admin/auth';
import { goalmatic_whatsapp_integration_otp } from '../whatsapp/templates/goalmatic_whatsapp_integration_otp';
import { send_WA_Message } from '../whatsapp/utils/sendMessage';
import { goals_db } from '../init';
import firebaseServer from '../init';
import { normalizePhoneNumber, normalizePhoneForWhatsApp, getPhoneQueryFormats } from '../utils/phoneUtils';

// Initialize Firebase Admin Auth
const auth = getAuth(firebaseServer()!);

// Helper function to check if phone number is linked to a different user
const isPhoneLinkedToAnotherUser = async (phoneNumber: string, currentUserId: string): Promise<{ isLinked: boolean; message?: string }> => {
    try {
        // Check if phone number exists as main phone in users collection (different user)
        const usersSnapshot = await goals_db.collection('users')
            .where('phone', '==', phoneNumber)
            .get();
        
        if (!usersSnapshot.empty) {
            const userDoc = usersSnapshot.docs[0];
            if (userDoc.id !== currentUserId) {
                return { 
                    isLinked: true, 
                    message: 'This phone number is already registered as the main phone for another account.' 
                };
            }
        }

        // Check if phone number exists in WhatsApp integrations (different user)
        const integrationsSnapshot = await goals_db.collectionGroup('integrations')
            .where('phone', '==', phoneNumber)
            .where('provider', '==', 'WHATSAPP')
            .get();
        
        if (!integrationsSnapshot.empty) {
            for (const doc of integrationsSnapshot.docs) {
                const integration = doc.data();
                if (integration.user_id !== currentUserId) {
                    return { 
                        isLinked: true, 
                        message: 'This WhatsApp number is already linked to another account.' 
                    };
                }
            }
        }
        
        return { isLinked: false };
    } catch (error) {
        console.error('Error checking phone number conflicts:', error);
        // In case of error, assume it might be in use to be safe
        return { 
            isLinked: true, 
            message: 'Unable to verify phone number availability. Please try again later.' 
        };
    }
};

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
            const currentUserId = request.auth.uid;
            
            // Normalize phone number
            const normalizedPhone = normalizePhoneNumber(phoneNumber);
            const whatsappPhone = normalizePhoneForWhatsApp(phoneNumber);

            if (!normalizedPhone || !whatsappPhone)
                throw new Error('Invalid phone number format');

            // Check if phone number is already linked to another user
            const conflictCheck = await isPhoneLinkedToAnotherUser(normalizedPhone, currentUserId);
            if (conflictCheck.isLinked) {
                return { 
                    code: 400, 
                    message: conflictCheck.message || 'This phone number is already in use by another account.' 
                };
            }

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

            // Check if phone number exists in WhatsApp integrations
            // For web app, we allow signup but track the integration status
            let whatsappIntegrationExists = false;
            try {
                const integrationsSnapshot = await goals_db.collectionGroup('integrations')
                    .where('phone', '==', phoneFormats.normalized)
                    .where('provider', '==', 'WHATSAPP')
                    .get();
                
                whatsappIntegrationExists = !integrationsSnapshot.empty;
                
                if (whatsappIntegrationExists) {
                    console.log(`Phone ${phoneFormats.normalized} already has WhatsApp integration, but allowing web signup`);
                }
            } catch (error) {
                console.error('Error checking WhatsApp integrations:', error);
                // Continue with signup if integration check fails
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
                    whatsapp_integration_exists: whatsappIntegrationExists, // Track integration status
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
