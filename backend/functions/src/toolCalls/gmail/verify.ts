import { goals_db } from '../../init'

export const verifyComposioGmailAccess = async (uid: string): Promise<{ exists: any, credentials: any }> => {
    const allIntegrations = await goals_db.collection('users')
        .doc(uid)
        .collection('integrations').where('type', '==', 'EMAIL').get()

    const gmailCreds = allIntegrations.docs.filter(doc => doc.data().provider === 'COMPOSIO')
    const ComposioGmailCredentials = gmailCreds.map(doc => doc.data())
    const defaultGmail = ComposioGmailCredentials.find(cred => cred.is_default)
    const gmail = defaultGmail ? defaultGmail : ComposioGmailCredentials[0]

    return {
        exists: gmail?.id ? true : false,
        credentials: gmail
    };
} 