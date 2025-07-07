import { goals_db } from '../../../init'

export const verifyGmailAccess = async (uid: string): Promise<{ exists: any, credentials: any }> => {
    const allIntegrations = await goals_db.collection('users')
        .doc(uid)
        .collection('integrations').where('type', '==', 'EMAIL').get()

    const emailCreds = allIntegrations.docs.filter(doc => doc.data().provider === 'GOOGLE')
    const GmailCredentials = emailCreds.map(doc => ({ 
        ...doc.data(), 
        id: doc.id, 
        user_id: uid 
    })) as any[]
    const defaultEmail = GmailCredentials.find(cred => cred.is_default)
    const email = defaultEmail ? defaultEmail : GmailCredentials[0]

    return {
        exists: email?.id ? true : false,
        credentials: email
    };
} 