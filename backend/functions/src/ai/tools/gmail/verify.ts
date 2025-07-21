import { goals_db } from '../../../init'

export const verifyGmailAccess = async (uid: string): Promise<{ exists: any, credentials: any }> => {
    const allIntegrations = await goals_db.collection('users')
        .doc(uid)
        .collection('integrations').where('type', '==', 'EMAIL').get()

    // Check for both Google OAuth and Composio integrations
    const emailCreds = allIntegrations.docs.filter(doc => doc.data().provider === 'GOOGLE_COMPOSIO')
    const GmailCredentials = emailCreds.map(doc => doc.data())
    const email =  GmailCredentials[0]

    return {
        exists: email?.id ? true : false,
        credentials: email
    };
}

