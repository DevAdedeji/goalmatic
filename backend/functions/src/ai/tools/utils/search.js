"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SEARCH_TOOL = exports.search = void 0;
const ai_1 = require("ai");
const zod_1 = require("zod");
const google_1 = require("@ai-sdk/google");
const google = (0, google_1.createGoogleGenerativeAI)({
    apiKey: process.env.GOOGLE_API_KEY,
});
exports.search = (0, ai_1.tool)({
    description: "Searches the internet for information",
    parameters: zod_1.z.object({
        query: zod_1.z.string(),
    }),
    execute: async ({ query }) => {
        const result = await (0, ai_1.generateText)({
            model: google("gemini-2.0-flash-001", { useSearchGrounding: true }),
            maxSteps: 2,
            prompt: `Search the internet for the following query: ${query}`,
        });
        return result.text;
    },
});
exports.SEARCH_TOOL = {
    id: "GOOGLESEARCH_TOOL",
    tool: exports.search,
};
