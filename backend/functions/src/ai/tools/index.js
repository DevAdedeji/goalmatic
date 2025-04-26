"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateAgentTools = void 0;
const list_1 = require("./list");
const generateAgentTools = (agentToolSpec) => {
    const includedTools = {};
    agentToolSpec.forEach((sentTool) => {
        const toolObject = list_1.availableTools[sentTool.id];
        if (toolObject) {
            includedTools[toolObject.id] = toolObject.tool;
        }
    });
    return includedTools;
};
exports.generateAgentTools = generateAgentTools;
