import { google } from 'googleapis';
import { verifyGoogleCalendarAccess } from "./verify";
import { getUserUid } from "../../index";
import { tool } from 'ai';
import { z } from 'zod';

const createGoogleCalendarEvent = async (params: {
    summary: string;
    description?: string; 
    startDateTime: string;
    endDateTime: string;
}) => {
    const uid = getUserUid();
    // Verify access and get credentials
    const { exists, credentials } = await verifyGoogleCalendarAccess(uid);
    if (!exists) throw new Error('Google Calendar not connected');

    // Initialize OAuth2 client
    const CLIENT_ID = process.env.GOOGLE_CALENDAR_CLIENT_ID;
    const CLIENT_SECRET = process.env.GOOGLE_CALENDAR_CLIENT_SECRET;
    
    const oAuth2Client = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET);
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
        } catch (error) {
            console.error('Error refreshing access token:', error);
            throw new Error('Failed to refresh Google Calendar access');
        }
    }

    // Initialize calendar service
    const calendar = google.calendar({ version: 'v3', auth: oAuth2Client });

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
    } catch (error) {
        console.error('Error creating Google Calendar event:', error);
        throw new Error('Failed to create calendar event');
    }
};

const createGoogleCalendarEventTool = tool({
    description: "Creates a new event on the user's Google Calendar",
    parameters: z.object({
        summary: z.string().describe("Title of the event"),
        description: z.string().optional().describe("Description of the event"),
        startDateTime: z.string().describe("Start datetime in RFC3339 format"),
        endDateTime: z.string().describe("End datetime in RFC3339 format"),
    }),
    execute: async (input: any) => {
        try {
            const event = await createGoogleCalendarEvent(input);
            return event;
        } catch (error) {
            console.error('Error in createGoogleCalendarEventTool:', error);
            throw new Error('Failed to create calendar event');
        }
    }
});

export const GOOGLECALENDAR_CREATE_EVENT = {
    id: "GOOGLECALENDAR_CREATE_EVENT",
    tool: createGoogleCalendarEventTool
};