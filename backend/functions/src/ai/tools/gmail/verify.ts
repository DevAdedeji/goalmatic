import { goals_db } from '../../../init'

export const verifyGmailAccess = async (uid: string): Promise<{ exists: any, credentials: any }> => {
    const allIntegrations = await goals_db.collection('users')
        .doc(uid)
        .collection('integrations').where('type', '==', 'EMAIL').get()

    // Check for both Google OAuth and Composio integrations
    const emailCreds = allIntegrations.docs.filter(doc => 
        doc.data().provider === 'GOOGLE' || doc.data().provider === 'COMPOSIO'
    )
    const GmailCredentials = emailCreds.map(doc => ({ 
        ...doc.data(), 
        id: doc.id, 
        user_id: uid 
    })) as any[]
    
    // Prefer Composio if available, fallback to Google OAuth
    const composioEmail = GmailCredentials.find(cred => cred.provider === 'COMPOSIO')
    const googleEmail = GmailCredentials.find(cred => cred.provider === 'GOOGLE' && cred.is_default)
    const email = composioEmail || googleEmail || GmailCredentials[0]

    return {
        exists: email?.id ? true : false,
        credentials: email
    };
}

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