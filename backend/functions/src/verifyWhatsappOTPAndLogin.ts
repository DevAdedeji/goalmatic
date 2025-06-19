import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { getAuth } from 'firebase-admin/auth';
import { goals_db } from './init';
import firebaseServer from './init';

// Initialize Firebase Admin Auth
const auth = getAuth(firebaseServer()!);

export const verifyWhatsappOTPAndLogin = onCall(
    {
        cors: true,
        region: 'us-central1',
    },
    async (request) => {
        try {
            const { phoneNumber, otp } = request.data;
            const cleanedPhoneNumber = phoneNumber.toString().replace('+', '').trim();

            if (!phoneNumber || !otp) {
                throw new Error('Missing required parameters: phoneNumber and otp');
            }

            // Verify OTP
            const otpDoc = await goals_db.collection('temp_otps').doc(cleanedPhoneNumber).get();
            
            if (!otpDoc.exists) {
                return { code: 400, message: 'OTP not found or expired' };
            }

            const otpData = otpDoc.data()!;
            
            // Check if OTP has expired
            if (new Date() > otpData.expires_at.toDate()) {
                // Clean up expired OTP
                await goals_db.collection('temp_otps').doc(cleanedPhoneNumber).delete();
                return { code: 400, message: 'OTP has expired. Please request a new one.' };
            }

            // Verify OTP matches
            if (otpData.otp !== otp) {
                return { code: 400, message: 'Invalid OTP' };
            }

            // Check if this is for login
            if (otpData.type !== 'login') {
                return { code: 400, message: 'Invalid OTP type' };
            }

            try {
                // Find user by phone number
                const userQuery = await goals_db.collection('users')
                    .where('phone', '==', phoneNumber)
                    .get();

                if (userQuery.empty) {
                    return { 
                        code: 400, 
                        message: 'No account found with this phone number. Please sign up first.' 
                    };
                }

                const userData = userQuery.docs[0].data();
                const userId = userData.id;

                // Verify user exists in Firebase Auth
                try {
                    await auth.getUser(userId);
                } catch (authError) {
                    console.error('User not found in Firebase Auth:', authError);
                    return { 
                        code: 400, 
                        message: 'Account verification failed. Please contact support.' 
                    };
                }

                // Update last login time in Firestore
                await goals_db.collection('users').doc(userId).update({
                    last_login_at: new Date(),
                    updated_at: new Date(),
                });

                // Create custom token for client-side authentication
                const customToken = await auth.createCustomToken(userId);

                // Clean up the temporary OTP
                await goals_db.collection('temp_otps').doc(cleanedPhoneNumber).delete();

                return { 
                    code: 200, 
                    message: 'Login successful',
                    userId: userId,
                    customToken: customToken
                };

            } catch (error: any) {
                console.error('Login error:', error);
                return { code: 500, message: 'Login failed. Please try again.' };
            }

        } catch (error) {
            console.error('VerifyWhatsappOTPAndLogin error:', error);
            throw new HttpsError('internal', `${error}`);
        }
    }
); 