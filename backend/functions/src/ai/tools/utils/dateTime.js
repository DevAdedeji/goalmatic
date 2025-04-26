"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CURRENT_DATE_TIME_TOOL = exports.getCurrentDateTime = void 0;
const ai_1 = require("ai");
const zod_1 = require("zod");
exports.getCurrentDateTime = (0, ai_1.tool)({
    description: "Gets the current date and time of the user",
    parameters: zod_1.z.object({}),
    execute: async () => {
        const tz = 'Africa/Lagos';
        const now = new Date();
        return {
            date: now.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                timeZone: tz,
            }),
            time: now.toLocaleTimeString('en-US', {
                timeZone: tz,
            }),
            iso: now.toISOString(),
        };
    },
});
exports.CURRENT_DATE_TIME_TOOL = {
    id: "DATETIME_TOOL",
    tool: exports.getCurrentDateTime,
};
