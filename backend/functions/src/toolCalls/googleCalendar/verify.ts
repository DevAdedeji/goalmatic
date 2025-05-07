import { goals_db } from '../../init'

export const verifyGoogleCalendarAccess = async (uid: string): Promise<{ exists: any, credentials: any }> => {
    const allIntegrations = await goals_db.collection('users')
        .doc(uid)
        .collection('integrations').where('type', '==', 'CALENDAR').get()

    const calendarCreds = allIntegrations.docs.filter(doc => doc.data().provider === 'GOOGLE')
    const GoogleCalendarCredentials = calendarCreds.map(doc => doc.data())
    const defaultCalendar = GoogleCalendarCredentials.find(cred => cred.is_default)
    const calendar = defaultCalendar ? defaultCalendar : GoogleCalendarCredentials[0]

    return {
        exists: calendar?.id ? true : false,
        credentials: calendar
    };
}