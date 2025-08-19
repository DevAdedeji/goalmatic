import { onDocumentCreated, onDocumentUpdated, onDocumentDeleted } from 'firebase-functions/v2/firestore';
import { goals_db_string } from '../init';
import { convertTimestamp } from '../utils/time';
import { upsertAgentDoc, deleteAgentDoc } from "./upstash";

const transformAgent = (firebaseId: string, data: any) => ({
  firebaseId,
  name: data.name || '',
  description: data.description || '',
  public: data.public || false,
  status: data.status || 'DRAFT',
  creator_id: data.creator_id || '',
  created_at: convertTimestamp(data.created_at),
  updated_at: convertTimestamp(data.updated_at),
});

export const upstashSyncAgentCreate = onDocumentCreated({
  document: 'agents/{agentId}',
  database: goals_db_string,
}, async (event) => {
  const agentId = event.params.agentId;
  const agentData = event.data?.data();
  if (!agentData) return;
  const a = transformAgent(agentId, agentData);
  await upsertAgentDoc(agentId, { name: a.name, description: a.description }, { public: a.public, creator_id: a.creator_id, status: a.status });
});

export const upstashSyncAgentUpdate = onDocumentUpdated({
  document: 'agents/{agentId}',
  database: goals_db_string,
}, async (event) => {
  const agentId = event.params.agentId;
  const afterData = event.data?.after.data();
  if (!afterData) return;
  const a = transformAgent(agentId, afterData);
  await upsertAgentDoc(agentId, { name: a.name, description: a.description }, { public: a.public, creator_id: a.creator_id, status: a.status });
});

export const upstashSyncAgentDelete = onDocumentDeleted({
  document: 'agents/{agentId}',
  database: goals_db_string,
}, async (event) => {
  const agentId = event.params.agentId;
  await deleteAgentDoc(agentId);
});

