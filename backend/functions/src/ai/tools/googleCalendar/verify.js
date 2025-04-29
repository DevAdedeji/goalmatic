"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyGoogleCalendarAccess = void 0;
const init_1 = require("../../../init");
const verifyGoogleCalendarAccess = async (uid) => {
    const allIntegrations = await init_1.goals_db.collection('users')
        .doc(uid)
        .collection('integrations').where('type', '==', 'CALENDAR').get();
    const calendarCreds = allIntegrations.docs.filter(doc => doc.data().provider === 'GOOGLE');
    const GoogleCalendarCredentials = calendarCreds.map(doc => doc.data());
    const defaultCalendar = GoogleCalendarCredentials.find(cred => cred.is_default);
    const calendar = defaultCalendar ? defaultCalendar : GoogleCalendarCredentials[0];
    return {
        exists: calendar?.id ? true : false,
        credentials: calendar
    };
};
exports.verifyGoogleCalendarAccess = verifyGoogleCalendarAccess;
