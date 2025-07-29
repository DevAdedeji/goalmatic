import { goals_db } from '../../../init'

export const verifyWhatsAppAccess = async (uid: string): Promise<{ exists: any, credentials: any }> => {
    const allIntegrations = await goals_db.collection('users')
        .doc(uid)
        .collection('integrations')
        .where('type', '==', 'MESSAGING')
        .where('provider', '==', 'WHATSAPP')
        .get()

    const whatsappCreds = allIntegrations.docs.filter(doc => doc.data().provider === 'WHATSAPP')
    const WhatsAppCredentials = whatsappCreds.map(doc => doc.data())
    const whatsappIntegration = WhatsAppCredentials[0]

    return {
        exists: whatsappIntegration?.id ? true : false,
        credentials: whatsappIntegration
    };
}
