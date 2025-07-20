import { google } from 'googleapis';
import { goals_db } from '../../../../init';

export interface GmailCredentials {
    access_token: string;
    refresh_token: string;
    expiry_date: number;
    id: string;
    user_id: string;
    email: string;
}

export const refreshAndUpdateGmailToken = async (credentials: GmailCredentials): Promise<GmailCredentials> => {
    const CLIENT_ID = process.env.G_AUTH_CLIENT_ID || process.env.GOOGLE_CALENDAR_CLIENT_ID;
    const CLIENT_SECRET = process.env.G_AUTH_CLIENT_SECRET || process.env.GOOGLE_CALENDAR_CLIENT_SECRET;
    
    if (!CLIENT_ID || !CLIENT_SECRET) {
        throw new Error('Google OAuth credentials not configured');
    }
    
    const oAuth2Client = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET);
    oAuth2Client.setCredentials({
        access_token: credentials.access_token,
        refresh_token: credentials.refresh_token,
        expiry_date: credentials.expiry_date
    });

    try {
        console.log('Refreshing Gmail access token...');
        const { credentials: newCredentials } = await oAuth2Client.refreshAccessToken();
        
        const updatedCredentials = {
            ...credentials,
            access_token: newCredentials.access_token!,
            expiry_date: newCredentials.expiry_date!
        };

        // Update the credentials in the database
        await goals_db.collection('users')
            .doc(credentials.user_id)
            .collection('integrations')
            .doc(credentials.id)
            .update({
                access_token: updatedCredentials.access_token,
                expiry_date: updatedCredentials.expiry_date,
                updated_at: new Date()
            });

        console.log('Gmail token refreshed and updated in database');
        return updatedCredentials;
    } catch (error: any) {
        console.error('Failed to refresh Gmail token:', error);
        throw new Error(`Token refresh failed: ${error.message}`);
    }
};

export const getGmailAuthClient = async (credentials: GmailCredentials) => {
    const CLIENT_ID = process.env.G_AUTH_CLIENT_ID || process.env.GOOGLE_CALENDAR_CLIENT_ID;
    const CLIENT_SECRET = process.env.G_AUTH_CLIENT_SECRET || process.env.GOOGLE_CALENDAR_CLIENT_SECRET;
    
    if (!CLIENT_ID || !CLIENT_SECRET) {
        throw new Error('Google OAuth credentials not configured');
    }
    
    const oAuth2Client = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET);
    
    // Check if token needs refresh (refresh if expires within 5 minutes)
    const needsRefresh = credentials.expiry_date <= Date.now() + (5 * 60 * 1000);
    
    if (needsRefresh) {
        console.log('Access token needs refresh');
        const refreshedCredentials = await refreshAndUpdateGmailToken(credentials);
        oAuth2Client.setCredentials({
            access_token: refreshedCredentials.access_token,
            refresh_token: refreshedCredentials.refresh_token,
            expiry_date: refreshedCredentials.expiry_date
        });
        return { oAuth2Client, credentials: refreshedCredentials };
    } else {
        oAuth2Client.setCredentials({
            access_token: credentials.access_token,
            refresh_token: credentials.refresh_token,
            expiry_date: credentials.expiry_date
        });
        return { oAuth2Client, credentials };
    }
};
