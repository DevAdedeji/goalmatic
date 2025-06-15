import { GOOGLECALENDAR_READ_EVENT } from "./googleCalendar/fetchEvent";
import { GOOGLECALENDAR_CREATE_EVENT } from "./googleCalendar/createEvent";
import { GOOGLECALENDAR_UPDATE_EVENT } from "./googleCalendar/updateEvent";
import { GOOGLECALENDAR_DELETE_EVENT } from "./googleCalendar/deleteEvent";
import { CURRENT_DATE_TIME_TOOL } from "../../toolCalls/utils//dateTime";
import { SEARCH_TOOL } from "../../toolCalls/utils/search";
import type { Tool } from 'ai';
import { TABLE_CREATE } from "./table/createRecord";
import { TABLE_READ } from "./table/readRecord";




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




    // Table tools
    [TABLE_CREATE.id]: TABLE_CREATE,
    [TABLE_READ.id]: TABLE_READ,

}