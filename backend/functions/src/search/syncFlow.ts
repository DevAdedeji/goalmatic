import { onDocumentCreated, onDocumentUpdated, onDocumentDeleted } from 'firebase-functions/v2/firestore';
import { goals_db_string } from '../init';
import { convertTimestamp } from '../utils/time';
import { upsertFlowDoc, deleteFlowDoc } from "./upstash";

const transformFlow = (firebaseId: string, data: any) => ({
  firebaseId,
  name: data.name || '',
  description: data.description || '',
  type: data.type || 'standard',
  public: data.public || false,
  status: data.status ?? 0,
  creator_id: data.creator_id || '',
  created_at: convertTimestamp(data.created_at),
  updated_at: convertTimestamp(data.updated_at),
});

export const upstashSyncFlowCreate = onDocumentCreated({
  document: 'flows/{flowId}',
  database: goals_db_string,
}, async (event) => {
  const flowId = event.params.flowId;
  const flowData = event.data?.data();
  if (!flowData) return;
  const f = transformFlow(flowId, flowData);
  await upsertFlowDoc(flowId, { name: f.name, description: f.description, type: f.type }, { public: f.public, creator_id: f.creator_id, status: f.status });
});

export const upstashSyncFlowUpdate = onDocumentUpdated({
  document: 'flows/{flowId}',
  database: goals_db_string,
}, async (event) => {
  const flowId = event.params.flowId;
  const afterData = event.data?.after.data();
  if (!afterData) return;
  const f = transformFlow(flowId, afterData);
  await upsertFlowDoc(flowId, { name: f.name, description: f.description, type: f.type }, { public: f.public, creator_id: f.creator_id, status: f.status });
});

export const upstashSyncFlowDelete = onDocumentDeleted({
  document: 'flows/{flowId}',
  database: goals_db_string,
}, async (event) => {
  const flowId = event.params.flowId;
  await deleteFlowDoc(flowId);
});

