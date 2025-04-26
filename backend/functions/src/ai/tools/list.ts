import { GOOGLECALENDAR_READ_EVENT } from "./googleCalendar/fetchEvent";
import { GOOGLECALENDAR_CREATE_EVENT } from "./googleCalendar/createEvent";
import { CURRENT_DATE_TIME_TOOL } from "./utils/dateTime";
import { SEARCH_TOOL } from "./utils/search";
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



    // Todo tools
    // [TODO_READ.id]: TODO_READ,
    // [TODO_CREATE.id]: TODO_CREATE,
    // [TODO_UPDATE.id]: TODO_UPDATE,
    // [TODO_DELETE.id]: TODO_DELETE,

    // Table tools
    [TABLE_CREATE.id]: TABLE_CREATE,
    [TABLE_READ.id]: TABLE_READ,

}