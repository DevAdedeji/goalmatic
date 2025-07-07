import { sendEmailNode } from "./node/messaging/sendEmail";
import { WorkflowContext } from "@upstash/workflow";
import { createGoogleCalendarEventNode } from "./node/googleCalendar/createEvent";
import { updateGoogleCalendarEventNode } from "./node/googleCalendar/updateEvent";
import { deleteGoogleCalendarEventNode } from "./node/googleCalendar/deleteEvent";
import { sendGmailEmailNode, readGmailEmailsNode, createGmailDraftNode } from "./node/gmail";
import { readTableNode, createRecordNode, updateRecordNode, deleteRecordNode } from "./node/table";
import { sendWhatsappMessageNode } from "./node/messaging/sendWhatsappMessage";

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
    [sendGmailEmailNode.nodeId]: sendGmailEmailNode,
    [readGmailEmailsNode.nodeId]: readGmailEmailsNode,
    [createGmailDraftNode.nodeId]: createGmailDraftNode,

    // Table nodes
    [readTableNode.nodeId]: readTableNode,
    [createRecordNode.nodeId]: createRecordNode,
    [updateRecordNode.nodeId]: updateRecordNode,
    [deleteRecordNode.nodeId]: deleteRecordNode
}