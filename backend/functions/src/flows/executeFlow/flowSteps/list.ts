import { sendEmailNode } from "./node/messaging/sendEmail";
import { WorkflowContext } from "@upstash/workflow";
import { createGoogleCalendarEventNode } from "./node/googleCalendar/createEvent";
import { updateGoogleCalendarEventNode } from "./node/googleCalendar/updateEvent";
import { deleteGoogleCalendarEventNode } from "./node/googleCalendar/deleteEvent";
import { sendComposioGmailEmailNode, readComposioGmailEmailsNode, createComposioGmailDraftNode } from "./node/gmail";
import { readTableNode, createRecordNode, updateRecordNode, deleteRecordNode } from "./node/table";
import { sendWhatsappMessageNode } from "./node/messaging/sendWhatsappMessage";
import { fetchWebContentNode, callWebApiNode, jobScraperNode } from "./node/web";
import { askAgentNode, askAiNode } from "./node/ai";

type NodeSignature = {
    nodeId: string;
    run: (context: WorkflowContext, props: any, previousStepResult?: any) => Promise<any>;
}

export const availableNodes: Record<string, NodeSignature> = {
    // Messaging nodes
    [sendEmailNode.nodeId]: sendEmailNode,
    [sendWhatsappMessageNode.nodeId]: sendWhatsappMessageNode,

    // Calendar nodes
    [createGoogleCalendarEventNode.nodeId]: createGoogleCalendarEventNode,
    [updateGoogleCalendarEventNode.nodeId]: updateGoogleCalendarEventNode,
    [deleteGoogleCalendarEventNode.nodeId]: deleteGoogleCalendarEventNode,

    // Gmail nodes
    [sendComposioGmailEmailNode.nodeId]: sendComposioGmailEmailNode,
    [readComposioGmailEmailsNode.nodeId]: readComposioGmailEmailsNode,
    [createComposioGmailDraftNode.nodeId]: createComposioGmailDraftNode,

    // Table nodes
    [readTableNode.nodeId]: readTableNode,
    [createRecordNode.nodeId]: createRecordNode,
    [updateRecordNode.nodeId]: updateRecordNode,
    [deleteRecordNode.nodeId]: deleteRecordNode,

    // Web nodes
    [fetchWebContentNode.nodeId]: fetchWebContentNode,
    [callWebApiNode.nodeId]: callWebApiNode,
    [jobScraperNode.nodeId]: jobScraperNode,

    // AI Agent nodes
    [askAgentNode.nodeId]: askAgentNode,
    [askAiNode.nodeId]: askAiNode
}