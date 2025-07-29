import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { goals_db } from '../init';
import { ConvexHttpClient } from 'convex/browser';
import { api } from '../../convex/src/_generated/api';

// Initialize Convex client based on environment
const getConvexClient = () => {
  const isDev = process.env.NODE_ENV === 'development';
  const convexUrl = isDev 
    ? process.env.CONVEX_DEV_URL 
    : process.env.CONVEX_PROD_URL;
  
  if (!convexUrl) {
    throw new Error(`Convex URL not configured for environment: ${process.env.NODE_ENV}`);
  }
  
  return new ConvexHttpClient(convexUrl);
};

// Convert Firebase Timestamp to Unix timestamp
const convertTimestamp = (timestamp: any): number => {
  if (timestamp && timestamp._seconds) {
    return timestamp._seconds * 1000;
  }
  if (timestamp && timestamp.toMillis) {
    return timestamp.toMillis();
  }
  if (timestamp instanceof Date) {
    return timestamp.getTime();
  }
  return Date.now();
};

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

export const migrateAgentsToConvex = onCall({
  cors: true,
  region: 'us-central1'
}, async (request) => {
  // Only allow admins to run migration
  if (!request.auth || !request.auth.token.admin) {
    throw new HttpsError('permission-denied', 'Only admins can run migration');
  }

  const { skipExisting = false, dryRun = false } = request.data || {};
  
  try {
    const convex = getConvexClient();
    const results = {
      total: 0,
      migrated: 0,
      skipped: 0,
      errors: 0,
      errorDetails: [] as string[]
    };

    // Get all agents from Firebase
    const agentsSnapshot = await goals_db.collection('agents').get();
    results.total = agentsSnapshot.size;


    for (const agentDoc of agentsSnapshot.docs) {
      try {
        const agentId = agentDoc.id;
        const agentData = agentDoc.data();

        // Check if agent already exists in Convex (if skipExisting is true)
        if (skipExisting) {
          try {
            const existingAgent = await convex.query(api.agents.getAgentByFirebaseId, {
              firebaseId: agentId
            });
            
            if (existingAgent) {
              results.skipped++;
              continue;
            }
          } catch (error:any) {
            // If query fails, assume agent doesn't exist and continue
            console.warn(`Error checking existing agent ${agentId}: ${error.message}`);
          }
        }

        const convexData = transformAgentForConvex(agentId, agentData);

        if (!dryRun) {
          await convex.mutation(api.agents.createAgent, convexData);
        }

        results.migrated++;

      } catch (error: any) {
        results.errors = (results.errors || 0) + 1;
        const errorMsg = `Error migrating agent ${agentDoc.id}: ${error.message}`;
        results.errorDetails.push(errorMsg);
        console.error(errorMsg);
      }
    }


    return {
      success: true,
      results,
      message: `Migration ${dryRun ? 'dry run ' : ''}completed. Total: ${results.total}, Migrated: ${results.migrated}, Skipped: ${results.skipped}, Errors: ${results.errors}`
    };

  } catch (error: any) {
    console.error('Migration failed:', error);
    throw new HttpsError('internal', `Migration failed: ${error.message}`);
  }
});

// Helper function to check migration status
export const checkMigrationStatus = onCall({
  cors: true,
  region: 'us-central1'
}, async (request) => {
  // Only allow admins to check status
  if (!request.auth || !request.auth.token.admin) {
    throw new HttpsError('permission-denied', 'Only admins can check migration status');
  }

  try {
    const convex = getConvexClient();

    // Count agents in Firebase
    const firebaseSnapshot = await goals_db.collection('agents').get();
    const firebaseCount = firebaseSnapshot.size;

    // Count agents in Convex (using a simple query)
    const convexAgents = await convex.query(api.agents.getPublicAgents, {});
    const privateAgents = await convex.query(api.agents.getAgentsByCreator, {
      creator_id: request.auth.uid
    });
    
    // This is a rough count - in a real scenario, you'd want a dedicated count query
    const convexCount = convexAgents.length + privateAgents.length;

    return {
      firebase_count: firebaseCount,
      convex_count: convexCount,
      synced: firebaseCount === convexCount
    };

  } catch (error: any) {
    console.error('Status check failed:', error);
    throw new HttpsError('internal', `Status check failed: ${error.message}`);
  }
}); 