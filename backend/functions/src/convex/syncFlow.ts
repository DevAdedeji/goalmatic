import { onDocumentCreated, onDocumentUpdated, onDocumentDeleted } from 'firebase-functions/v2/firestore';
import { api } from '../../convex/src/_generated/api';
import { goals_db_string } from '../init';
import { getConvexClient, convertTimestamp } from './utils';

// Transform Firebase flow data to Convex format
const transformFlowForConvex = (firebaseId: string, data: any) => {
  return {
    firebaseId,
    name: data.name || '',
    description: data.description || '',
    type: data.type || 'standard',
    steps: data.steps || [],
    status: data.status ?? 0,
    creator_id: data.creator_id || '',
    user: {
      id: data.user?.id || data.creator_id || '',
      name: data.user?.name
    },
    created_at: convertTimestamp(data.created_at),
    updated_at: convertTimestamp(data.updated_at),
    public: data.public || false,
    cloned_from: data.cloned_from
  };
};

// Sync flow creation from Firebase to Convex
export const convexSyncFlowCreate = onDocumentCreated({
  document: 'flows/{flowId}',
  database: goals_db_string,
}, async (event) => {
  console.log('convexSyncFlowCreate triggered for:', event.params.flowId);
  try {
    const flowId = event.params.flowId;
    const flowData = event.data?.data();
    
    if (!flowData) {
      console.error('No flow data found for creation sync');
      return;
    }

    // Validate required fields
    if (!flowData.name || !flowData.creator_id) {
      console.error('Missing required fields in flow data:', { name: flowData.name, creator_id: flowData.creator_id });
      return;
    }

    const convex = getConvexClient();
    
    // Check if flow already exists (in case of race condition)
    const existingFlow = await convex.query(api.flows.getFlowByFirebaseId, {
      firebaseId: flowId
    });
    
    if (existingFlow) {
      console.log(`Flow ${flowId} already exists in Convex, skipping creation`);
      return;
    }
    
    const convexData = transformFlowForConvex(flowId, flowData);
    
    console.log('Sending flow data to Convex:', JSON.stringify(convexData, null, 2));
    
    await convex.mutation(api.flows.createFlow, convexData);
    
    console.log(`Successfully synced flow creation to Convex: ${flowId}`);
  } catch (error) {
    console.error('Error syncing flow creation to Convex:', error);
    console.error('Event data:', JSON.stringify(event.data?.data(), null, 2));
    // Don't throw error to avoid Firebase function retries
  }
});

// Sync flow updates from Firebase to Convex
export const convexSyncFlowUpdate = onDocumentUpdated({
  document: 'flows/{flowId}',
  database: goals_db_string,
}, async (event) => {
  console.log('convexSyncFlowUpdate triggered for:', event.params.flowId);
  try {
    const flowId = event.params.flowId;
    const beforeData = event.data?.before.data();
    const afterData = event.data?.after.data();
    
    if (!afterData) {
      console.error('No flow data found for update sync');
      return;
    }

    // Check if this update came from Convex to avoid circular sync
    if (afterData._convexSyncSkip) {
      console.log(`Skipping Firebase->Convex sync for ${flowId} (originated from Convex)`);
      return;
    }

    const convex = getConvexClient();
    
    // Check if flow exists in Convex
    const existingFlow = await convex.query(api.flows.getFlowByFirebaseId, {
      firebaseId: flowId
    });
    
    if (!existingFlow) {
      console.log(`Flow ${flowId} not found in Convex during update, creating first...`);
      
      // Validate required fields for creation
      if (!afterData.name || !afterData.creator_id) {
        console.error('Cannot create flow during update - missing required fields:', { 
          name: afterData.name, 
          creator_id: afterData.creator_id 
        });
        return;
      }
      
      // Create the flow first (upsert pattern)
      const convexData = transformFlowForConvex(flowId, afterData);
      await convex.mutation(api.flows.createFlow, convexData);
      console.log(`Successfully created flow during update sync: ${flowId}`);
      return;
    }
    
    // Prepare update data - only include fields that have changed
    const updates: any = {
      updated_at: convertTimestamp(afterData.updated_at)
    };

    if (beforeData?.name !== afterData.name) {
      updates.name = afterData.name;
    }
    if (beforeData?.description !== afterData.description) {
      updates.description = afterData.description;
    }
    if (beforeData?.type !== afterData.type) {
      updates.type = afterData.type;
    }
    if (JSON.stringify(beforeData?.steps) !== JSON.stringify(afterData.steps)) {
      updates.steps = afterData.steps;
    }
    if (beforeData?.status !== afterData.status) {
      updates.status = afterData.status;
    }
    if (beforeData?.public !== afterData.public) {
      updates.public = afterData.public;
    }

    await convex.mutation(api.flows.updateFlow, {
      firebaseId: flowId,
      updates
    });
    
    console.log(`Successfully synced flow update to Convex: ${flowId}`);
  } catch (error) {
    console.error('Error syncing flow update to Convex:', error);
    // Don't throw error to avoid Firebase function retries
  }
});

// Sync flow deletion from Firebase to Convex
export const convexSyncFlowDelete = onDocumentDeleted({
  document: 'flows/{flowId}',
  database: goals_db_string,
}, async (event) => {
  try {
    const flowId = event.params.flowId;
    
    const convex = getConvexClient();
    await convex.mutation(api.flows.deleteFlow, {
      firebaseId: flowId
    });
    
    console.log(`Successfully synced flow deletion to Convex: ${flowId}`);
  } catch (error) {
    console.error('Error syncing flow deletion to Convex:', error);
    // Don't throw error to avoid Firebase function retries
  }
}); 

// firebase functions:delete syncAgentDelete syncTableUpdate syncUserDelete syncFlowUpdate syncTableDelete syncUserCreate syncTableCreate syncFlowDelete syncAgentUpdate syncFlowCreate syncUserUpdate   --region=us-central1