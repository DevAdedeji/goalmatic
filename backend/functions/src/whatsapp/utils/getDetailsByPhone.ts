import { goals_db } from '../../init';
import { normalizePhoneNumber } from '../../utils/phoneUtils';

export const getDetailsByPhone = async (phoneStr: string) => {
    try {
        const normalizedPhone = normalizePhoneNumber(phoneStr);
        
        if (!normalizedPhone) {
            return { data: null, status: 400 }; // Invalid phone number
        }

        // Query only for normalized format (after migration, all data should be normalized)
        const userProfile = await goals_db.collectionGroup('integrations')
            .where('phone', '==', normalizedPhone)
            .where('provider', '==', 'WHATSAPP')
            .get();

        if (userProfile.empty) {
            return { data: null, status: 404 };
        }

        return {
            data: userProfile.docs[0]?.data() as Record<string, any>,
            status: 200,
        };
    } catch (e) {
        console.error('Error in getDetailsByPhone:', e);
        return { data: e, status: 500 };
    }
}


