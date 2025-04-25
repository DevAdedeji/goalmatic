import { sendEmailNode } from "./node/messaging/sendEmail";
import { WorkflowContext } from "@upstash/workflow";
import { createGoogleCalendarEventNode } from "./node/googleCalendar/createEvent";
import { readTableNode, createRecordNode, updateRecordNode, deleteRecordNode } from "./node/table";

type NodeSignature = {
    nodeId: string;
    run: (context: WorkflowContext, props: any, previousStepResult?: any) => Promise<any>;
}

export const availableNodes: Record<string, NodeSignature> = {
    // Messaging nodes
    [sendEmailNode.nodeId]: sendEmailNode,
    // [sendWhatsappMessageNode.nodeId]: sendWhatsappMessageNode,

    // Calendar nodes
    [createGoogleCalendarEventNode.nodeId]: createGoogleCalendarEventNode,

    // Todo nodes
    // [readTodoNode.nodeId]: readTodoNode,
    // [createTodoNode.nodeId]: createTodoNode,
    // [updateTodoNode.nodeId]: updateTodoNode,
    // [deleteTodoNode.nodeId]: deleteTodoNode,

    // Table nodes
    [readTableNode.nodeId]: readTableNode,
    [createRecordNode.nodeId]: createRecordNode,
    [updateRecordNode.nodeId]: updateRecordNode,
    [deleteRecordNode.nodeId]: deleteRecordNode
}