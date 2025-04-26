"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GOOGLECALENDAR_CREATE_EVENT = void 0;
const googleapis_1 = require("googleapis");
const verify_1 = require("./verify");
const index_1 = require("../../index");
const ai_1 = require("ai");
const zod_1 = require("zod");
const createGoogleCalendarEvent = async (params) => {
    const uid = (0, index_1.getUserUid)();
    // Verify access and get credentials
    const { exists, credentials } = await (0, verify_1.verifyGoogleCalendarAccess)(uid);
    if (!exists)
        throw new Error('Google Calendar not connected');
    // Initialize OAuth2 client
    const CLIENT_ID = process.env.GOOGLE_CALENDAR_CLIENT_ID;
    const CLIENT_SECRET = process.env.GOOGLE_CALENDAR_CLIENT_SECRET;
    const oAuth2Client = new googleapis_1.google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET);
    oAuth2Client.setCredentials({
        access_token: credentials.access_token,
        refresh_token: credentials.refresh_token,
        expiry_date: credentials.expiry_date
    });
    // Check if token needs refresh
    const isTokenExpired = credentials.expiry_date <= Date.now();
    if (isTokenExpired) {
        try {
            const { credentials: newCredentials } = await oAuth2Client.refreshAccessToken();
            credentials.access_token = newCredentials.access_token;
            credentials.expiry_date = newCredentials.expiry_date;
        }
        catch (error) {
            console.error('Error refreshing access token:', error);
            throw new Error('Failed to refresh Google Calendar access');
        }
    }
    // Initialize calendar service
    const calendar = googleapis_1.google.calendar({ version: 'v3', auth: oAuth2Client });
    try {
        const event = {
            summary: params.summary,
            description: params.description,
            start: {
                dateTime: new Date(params.startDateTime).toISOString().replace(/\.000Z/i, ''),
                timeZone: 'Africa/Lagos'
            },
            end: {
                dateTime: new Date(params.endDateTime).toISOString().replace(/\.000Z/i, ''),
                timeZone: 'Africa/Lagos'
            },
        };
        const response = await calendar.events.insert({
            calendarId: 'primary',
            requestBody: event,
        });
        return response.data;
    }
    catch (error) {
        console.error('Error creating Google Calendar event:', error);
        throw new Error('Failed to create calendar event');
    }
};
const createGoogleCalendarEventTool = (0, ai_1.tool)({
    description: "Creates a new event on the user's Google Calendar",
    parameters: zod_1.z.object({
        summary: zod_1.z.string().describe("Title of the event"),
        description: zod_1.z.string().optional().describe("Description of the event"),
        startDateTime: zod_1.z.string().describe("Start datetime in RFC3339 format"),
        endDateTime: zod_1.z.string().describe("End datetime in RFC3339 format"),
    }),
    execute: async (input) => {
        try {
            const event = await createGoogleCalendarEvent(input);
            return event;
        }
        catch (error) {
            console.error('Error in createGoogleCalendarEventTool:', error);
            throw new Error('Failed to create calendar event');
        }
    }
});
exports.GOOGLECALENDAR_CREATE_EVENT = {
    id: "GOOGLECALENDAR_CREATE_EVENT",
    tool: createGoogleCalendarEventTool
};
