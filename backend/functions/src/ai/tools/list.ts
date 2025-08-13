import { GOOGLECALENDAR_READ_EVENT } from "./googleCalendar/fetchEvent";
import { GOOGLECALENDAR_CREATE_EVENT } from "./googleCalendar/createEvent";
import { GOOGLECALENDAR_UPDATE_EVENT } from "./googleCalendar/updateEvent";
import { GOOGLECALENDAR_DELETE_EVENT } from "./googleCalendar/deleteEvent";
import { GMAIL_SEND_EMAIL } from "./gmail/sendEmail";
import { GMAIL_READ_EMAILS } from "./gmail/readEmails";
import { GMAIL_CREATE_DRAFT } from "./gmail/createDraft";
import { CURRENT_DATE_TIME_TOOL } from "../../toolCalls/utils//dateTime";
import { SEARCH_TOOL } from "../../toolCalls/utils/search";
import type { Tool } from 'ai';
import { TABLE_CREATE } from "./table/createRecord";
import { TABLE_READ } from "./table/readRecord";
import { SEND_WHATSAPP_MESSAGE_TOOL } from './whatsapp/sendMessage';
import { SEND_EMAIL_TOOL } from './email/sendEmail';
import { REMINDER_SET_TOOL } from './reminder/setReminder';




type ToolSignature = {
    id: string;
    tool: Tool;
}

export const availableTools: Record<string, ToolSignature> = {
    // Utility tools
    [CURRENT_DATE_TIME_TOOL.id]: CURRENT_DATE_TIME_TOOL,
    [SEARCH_TOOL.id]: SEARCH_TOOL,

    // Google Calendar tools
    [GOOGLECALENDAR_READ_EVENT.id]: GOOGLECALENDAR_READ_EVENT,
    [GOOGLECALENDAR_CREATE_EVENT.id]: GOOGLECALENDAR_CREATE_EVENT,
    [GOOGLECALENDAR_UPDATE_EVENT.id]: GOOGLECALENDAR_UPDATE_EVENT,
    [GOOGLECALENDAR_DELETE_EVENT.id]: GOOGLECALENDAR_DELETE_EVENT,

    // Gmail tools (Composio)
    [GMAIL_SEND_EMAIL.id]: GMAIL_SEND_EMAIL,
    [GMAIL_READ_EMAILS.id]: GMAIL_READ_EMAILS,
    [GMAIL_CREATE_DRAFT.id]: GMAIL_CREATE_DRAFT,

    // Messaging tools
    [SEND_WHATSAPP_MESSAGE_TOOL.id]: SEND_WHATSAPP_MESSAGE_TOOL,
    [SEND_EMAIL_TOOL.id]: SEND_EMAIL_TOOL,
    [REMINDER_SET_TOOL.id]: REMINDER_SET_TOOL,

    // Table tools
    [TABLE_CREATE.id]: TABLE_CREATE,
    [TABLE_READ.id]: TABLE_READ,

}