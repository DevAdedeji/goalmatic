import { onDocumentCreated, onDocumentUpdated, onDocumentDeleted } from 'firebase-functions/v2/firestore';
import { api } from '../../convex/src/_generated/api';
import { goals_db_string } from '../init';
import { getConvexClient, convertTimestamp } from './utils';

// Transform Firebase agent data to Convex format
const transformAgentForConvex = (firebaseId: string, data: any) => {
  return {
    firebaseId,
    name: data.name || '',
    description: data.description || '',
    avatar: data.avatar,
    public: data.public || false,
    status: data.status || 'DRAFT',
    creator_id: data.creator_id || '',
    user: {
      id: data.user?.id || data.creator_id || '',
      name: data.user?.name
    },
    spec: {
      systemInfo: data.spec?.systemInfo || 'You are a helpful assistant',
      tools: data.spec?.tools || [],
      toolsConfig: data.spec?.toolsConfig
    },
    created_at: convertTimestamp(data.created_at),
    updated_at: convertTimestamp(data.updated_at),
    last_used: data.last_used ? convertTimestamp(data.last_used) : undefined,
    cloned_from: data.cloned_from,
    firebase_synced: true,
    last_sync: Date.now()
  };
};

// Sync agent creation from Firebase to Convex
export const convexSyncAgentCreate = onDocumentCreated({
  document: 'agents/{agentId}',
  database: goals_db_string,
}, async (event) => {
  console.log('convexSyncAgentCreate triggered for:', event.params.agentId);
  try {
    const agentId = event.params.agentId;
    const agentData = event.data?.data();
    
    if (!agentData) {
      console.error('No agent data found for creation sync');
      return;
    }

    // Validate required fields
    if (!agentData.name || !agentData.creator_id) {
      console.error('Missing required fields in agent data:', { name: agentData.name, creator_id: agentData.creator_id });
      return;
    }

    const convex = getConvexClient();
    
    // Check if agent already exists (in case of race condition)
    const existingAgent = await convex.query(api.agents.getAgentByFirebaseId, {
      firebaseId: agentId
    });
    
    if (existingAgent) {
      console.log(`Agent ${agentId} already exists in Convex, skipping creation`);
      return;
    }
    
    const convexData = transformAgentForConvex(agentId, agentData);
    
    console.log('Sending agent data to Convex:', JSON.stringify(convexData, null, 2));
    
    await convex.mutation(api.agents.createAgent, convexData);
    
    console.log(`Successfully synced agent creation to Convex: ${agentId}`);
  } catch (error) {
    console.error('Error syncing agent creation to Convex:', error);
    console.error('Event data:', JSON.stringify(event.data?.data(), null, 2));
    // Don't throw error to avoid Firebase function retries
  }
});

// Sync agent updates from Firebase to Convex
export const convexSyncAgentUpdate = onDocumentUpdated({
  document: 'agents/{agentId}',
  database: goals_db_string,
}, async (event) => {
  console.log('convexSyncAgentUpdate triggered for:', event.params.agentId);
  try {
    const agentId = event.params.agentId;
    const beforeData = event.data?.before.data();
    const afterData = event.data?.after.data();
    
    if (!afterData) {
      console.error('No agent data found for update sync');
      return;
    }

    // Check if this update came from Convex to avoid circular sync
    if (afterData._convexSyncSkip) {
      console.log(`Skipping Firebase->Convex sync for ${agentId} (originated from Convex)`);
      return;
    }

    const convex = getConvexClient();
    
    // Check if agent exists in Convex
    const existingAgent = await convex.query(api.agents.getAgentByFirebaseId, {
      firebaseId: agentId
    });
    
    if (!existingAgent) {
      console.log(`Agent ${agentId} not found in Convex during update, creating first...`);
      
      // Validate required fields for creation
      if (!afterData.name || !afterData.creator_id) {
        console.error('Cannot create agent during update - missing required fields:', { 
          name: afterData.name, 
          creator_id: afterData.creator_id 
        });
        return;
      }
      
      // Create the agent first (upsert pattern)
      const convexData = transformAgentForConvex(agentId, afterData);
      await convex.mutation(api.agents.createAgent, convexData);
      console.log(`Successfully created agent during update sync: ${agentId}`);
      return;
    }
    
    // Prepare update data - only include fields that have changed
    const updates: any = {
      updated_at: convertTimestamp(afterData.updated_at)
    };

    // Add last_used if it exists
    if (afterData.last_used) {
      updates.last_used = convertTimestamp(afterData.last_used);
    }

    if (beforeData?.name !== afterData.name) {
      updates.name = afterData.name;
    }
    if (beforeData?.description !== afterData.description) {
      updates.description = afterData.description;
    }
    if (beforeData?.system_prompt !== afterData.system_prompt) {
      updates.system_prompt = afterData.system_prompt;
    }
    if (beforeData?.voice_enabled !== afterData.voice_enabled) {
      updates.voice_enabled = afterData.voice_enabled;
    }
    if (beforeData?.voice_id !== afterData.voice_id) {
      updates.voice_id = afterData.voice_id;
    }
    if (beforeData?.public !== afterData.public) {
      updates.public = afterData.public;
    }
    if (beforeData?.clone_count !== afterData.clone_count) {
      updates.clone_count = afterData.clone_count;
    }
    if (beforeData?.llm_model !== afterData.llm_model) {
      updates.llm_model = afterData.llm_model;
    }
    if (beforeData?.temperature !== afterData.temperature) {
      updates.temperature = afterData.temperature;
    }
    if (beforeData?.max_tokens !== afterData.max_tokens) {
      updates.max_tokens = afterData.max_tokens;
    }
    if (JSON.stringify(beforeData?.enabled_tools) !== JSON.stringify(afterData.enabled_tools)) {
      updates.enabled_tools = afterData.enabled_tools;
    }
    if (JSON.stringify(beforeData?.knowledge_base) !== JSON.stringify(afterData.knowledge_base)) {
      updates.knowledge_base = afterData.knowledge_base;
    }

    await convex.mutation(api.agents.updateAgent, {
      firebaseId: agentId,
      updates
    });
    
    console.log(`Successfully synced agent update to Convex: ${agentId}`);
  } catch (error) {
    console.error('Error syncing agent update to Convex:', error);
    // Don't throw error to avoid Firebase function retries
  }
});

// Sync agent deletion from Firebase to Convex
export const convexSyncAgentDelete = onDocumentDeleted({
  document: 'agents/{agentId}',
  database: goals_db_string,
}, async (event) => {
  try {
    const agentId = event.params.agentId;
    
    const convex = getConvexClient();
    await convex.mutation(api.agents.deleteAgent, {
      firebaseId: agentId
    });
    
    console.log(`Successfully synced agent deletion to Convex: ${agentId}`);
  } catch (error) {
    console.error('Error syncing agent deletion to Convex:', error);
    // Don't throw error to avoid Firebase function retries
  }
}); 


