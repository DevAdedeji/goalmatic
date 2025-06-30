import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { goals_db } from '../init';

export const updateUserName = onCall(
    {
        cors: true,
        region: 'us-central1',
    },
    async (request) => {
        try {
            if (!request.auth) {
                throw new HttpsError('unauthenticated', 'Unauthorized');
            }

            const { newName } = request.data;
            const userId = request.auth.uid;

            if (!newName || newName.trim() === '') {
                throw new Error('New name is required');
            }

            // Update user document
            await goals_db.collection('users').doc(userId).update({
                name: newName.trim(),
                username: newName.trim(),
                updated_at: new Date(),
            });

            return { 
                code: 200, 
                message: 'User name updated successfully' 
            };

        } catch (error) {
            console.error('UpdateUserName error:', error);
            throw new HttpsError('internal', `${error}`);
        }
    }
); 