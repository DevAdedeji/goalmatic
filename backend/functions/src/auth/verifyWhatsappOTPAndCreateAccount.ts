import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { getAuth } from 'firebase-admin/auth';
import { v4 as uuidv4 } from 'uuid';
import { Timestamp } from 'firebase-admin/firestore';
import { goals_db } from '../init';
import firebaseServer from '../init';
import { normalizePhoneNumber } from '../utils/phoneUtils';

// Initialize Firebase Admin Auth
const auth = getAuth(firebaseServer()!);

export const verifyWhatsappOTPAndCreateAccount = onCall(
    {
        cors: true,
        region: 'us-central1',
    },
    async (request) => {
        try {
            const { phoneNumber, otp, fullName } = request.data;
            
            // Normalize phone number
            const normalizedPhone = normalizePhoneNumber(phoneNumber);


            if (!normalizedPhone || !otp || !fullName) {
                throw new Error('Missing required parameters: phoneNumber, otp, and fullName');
            }

            // Verify OTP (using normalized phone as key)
            const otpDoc = await goals_db.collection('temp_otps').doc(normalizedPhone).get();
            
            if (!otpDoc.exists) {
                return { code: 400, message: 'OTP not found or expired' };
            }

            const otpData = otpDoc.data()!;
            
            // Check if OTP has expired
            if (new Date() > otpData.expires_at.toDate()) {
                // Clean up expired OTP
                await goals_db.collection('temp_otps').doc(normalizedPhone).delete();
                return { code: 400, message: 'OTP has expired. Please request a new one.' };
            }

            // Verify OTP matches
            if (otpData.otp !== otp) {
                return { code: 400, message: 'Invalid OTP' };
            }

            // Check if this is for signup
            if (otpData.type !== 'signup') {
                return { code: 400, message: 'Invalid OTP type' };
            }

            try {
                // Create Firebase Auth user with phone number
                const userRecord = await auth.createUser({
                    phoneNumber: normalizedPhone,
                    disabled: false,
                });

                // Check for referral code in localStorage (passed from frontend)
                let referredBy: string | null = null;
                if (request.data.referralCode) {
                    referredBy = request.data.referralCode;
                }

                // Create user document in Firestore - always use normalized format
                await goals_db.collection('users').doc(userRecord.uid).set({
                    id: userRecord.uid,
                    name: fullName,
                    photo_url: null,
                    email: null,
                    phone: normalizedPhone, // Use normalized format consistently
                    username: fullName,
                    referred_by: referredBy,
                    created_at: Timestamp.fromDate(new Date()),
                    updated_at: Timestamp.fromDate(new Date()),
                    timezone: 'UTC', // Default timezone
                    signup_method: 'whatsapp_phone',
                    phone_verified: true,
                });

                // Only create WhatsApp integration if it doesn't already exist
                // Check the flag we stored during OTP creation
                const shouldCreateIntegration = !otpData.whatsapp_integration_exists;
                
                if (shouldCreateIntegration) {
                    const integrationId = uuidv4();
                    await goals_db.collection('users').doc(userRecord.uid).collection('integrations').doc(integrationId).set({
                        id: integrationId,
                        type: 'MESSAGING',
                        provider: 'WHATSAPP',
                        phone: normalizedPhone, // Use normalized format consistently
                        created_at: Timestamp.fromDate(new Date()),
                        updated_at: Timestamp.fromDate(new Date()),
                        integration_id: 'WHATSAPP',
                        user_id: userRecord.uid,
                    });
                } else {
                    console.log(`Skipping WhatsApp integration creation - phone ${normalizedPhone} already has WhatsApp integration`);
                }

                // Create custom token for client-side authentication
                const customToken = await auth.createCustomToken(userRecord.uid);

                // Clean up the temporary OTP
                await goals_db.collection('temp_otps').doc(normalizedPhone).delete();

                return { 
                    code: 200, 
                    message: 'Account created successfully',
                    userId: userRecord.uid,
                    customToken: customToken
                };

            } catch (authError: any) {
                console.error('Auth creation error:', authError);
                
                let errorMessage = 'Failed to create account';
                if (authError.code === 'auth/phone-number-already-exists') {
                    errorMessage = 'This phone number is already registered. Please try logging in instead.';
                }
                
                return { code: 400, message: errorMessage };
            }

        } catch (error) {
            console.error('VerifyWhatsappOTPAndCreateAccount error:', error);
            throw new HttpsError('internal', `${error}`);
        }
    }
); 