"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.availableTools = void 0;
const fetchEvent_1 = require("./googleCalendar/fetchEvent");
const createEvent_1 = require("./googleCalendar/createEvent");
const dateTime_1 = require("./utils/dateTime");
const search_1 = require("./utils/search");
const createRecord_1 = require("./table/createRecord");
const readRecord_1 = require("./table/readRecord");
exports.availableTools = {
    // Utility tools
    [dateTime_1.CURRENT_DATE_TIME_TOOL.id]: dateTime_1.CURRENT_DATE_TIME_TOOL,
    [search_1.SEARCH_TOOL.id]: search_1.SEARCH_TOOL,
    // Google Calendar tools
    [fetchEvent_1.GOOGLECALENDAR_READ_EVENT.id]: fetchEvent_1.GOOGLECALENDAR_READ_EVENT,
    [createEvent_1.GOOGLECALENDAR_CREATE_EVENT.id]: createEvent_1.GOOGLECALENDAR_CREATE_EVENT,
    // Todo tools
    // [TODO_READ.id]: TODO_READ,
    // [TODO_CREATE.id]: TODO_CREATE,
    // [TODO_UPDATE.id]: TODO_UPDATE,
    // [TODO_DELETE.id]: TODO_DELETE,
    // Table tools
    [createRecord_1.TABLE_CREATE.id]: createRecord_1.TABLE_CREATE,
    [readRecord_1.TABLE_READ.id]: readRecord_1.TABLE_READ,
};
