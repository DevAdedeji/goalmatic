import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { goalmatic_whatsapp_integration_otp } from './whatsapp/templates/goalmatic_whatsapp_integration_otp';
import { send_WA_Message } from './whatsapp/utils/sendMessage';
import { goals_db } from './init';


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
            const cleanedPhoneNumber = phoneNumber.replace('+', '').trim();

            if (!phoneNumber)
                throw new Error('Missing required parameter: phoneNumber');

            const otp = generateFourDigitOTP();

            const waMsg = goalmatic_whatsapp_integration_otp({
                otp: otp,
                recipientNumber: cleanedPhoneNumber,
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
            console.error('Error in Calendar Assistant:', error);
            throw new HttpsError('internal', `${error}`);
        }
    }
);

const generateFourDigitOTP = () => {
    return Math.floor(1000 + Math.random() * 9000).toString();
};
