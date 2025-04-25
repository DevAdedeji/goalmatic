import { goals_db } from '../../init';

export const getDetailsByPhone = async (phoneStr: string) => {
    try {
        const cleanedPhoneNumber = phoneStr.replace('+', '').trim();
        const userProfile = await goals_db.collectionGroup('integrations').where('phone', '==', cleanedPhoneNumber).where('provider', '==', 'WHATSAPP').get()

        if (userProfile.empty) {
            return { data: null, status: 404 }
        }

        // const userData = userProfile.docs[0]?.data()

        return {
            data: userProfile.docs[0]?.data() as Record<string, any>,
            status: 200,
        }
    } catch (e) {
        return { data: e, status: 500 }
    }
}


