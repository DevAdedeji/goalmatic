import { onCall, HttpsError } from 'firebase-functions/v2/https';
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

export const searchAgents = onCall({
  cors: true,
  region: 'us-central1'
}, async (request) => {
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'Authentication required');
  }

  const { 
    query, 
    searchType = 'full', // 'name', 'description', 'full'
    creator_id, 
    public_only = false 
  } = request.data;

  if (!query || typeof query !== 'string' || query.trim().length === 0) {
    throw new HttpsError('invalid-argument', 'Search query is required');
  }

  try {
    const convex = getConvexClient();
    let results: any[] = [];

    switch (searchType) {
      case 'name':
        results = await convex.query(api.agents.searchAgents, {
          query: query.trim(),
          creator_id,
          public_only
        });
        break;
      
      case 'description':
        results = await convex.query(api.agents.searchAgentsByDescription, {
          query: query.trim(),
          creator_id,
          public_only
        });
        break;
      
      case 'full':
      default:
        results = await convex.query(api.agents.searchAgentsFullText, {
          query: query.trim(),
          creator_id,
          public_only
        });
        break;
    }

    return {
      success: true,
      results,
      count: results.length,
      query: query.trim(),
      searchType
    };

  } catch (error: any) {
    console.error('Search failed:', error);
    throw new HttpsError('internal', `Search failed: ${error.message}`);
  }
});

// Get agents by creator (replacement for Firebase query)
export const getAgentsByCreator = onCall({
  cors: true,
  region: 'us-central1'
}, async (request) => {
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'Authentication required');
  }

  const { creator_id } = request.data;
  const requesterId = request.auth.uid;

  // Users can only get their own agents unless they're getting public agents
  if (creator_id && creator_id !== requesterId) {
    throw new HttpsError('permission-denied', 'Cannot access other users\' agents');
  }

  try {
    const convex = getConvexClient();
    const results = await convex.query(api.agents.getAgentsByCreator, {
      creator_id: creator_id || requesterId
    });

    return {
      success: true,
      results,
      count: results.length
    };

  } catch (error: any) {
    console.error('Get agents by creator failed:', error);
    throw new HttpsError('internal', `Failed to get agents: ${error.message}`);
  }
});

// Get public agents (replacement for Firebase query)
export const getPublicAgents = onCall({
  cors: true,
  region: 'us-central1'
}, async (request) => {
  try {
    const convex = getConvexClient();
    const results = await convex.query(api.agents.getPublicAgents, {});

    return {
      success: true,
      results,
      count: results.length
    };

  } catch (error: any) {
    console.error('Get public agents failed:', error);
    throw new HttpsError('internal', `Failed to get public agents: ${error.message}`);
  }
});

// Get a specific agent by Firebase ID (replacement for Firebase get)
export const getAgentByFirebaseId = onCall({
  cors: true,
  region: 'us-central1'
}, async (request) => {
  const { firebaseId } = request.data;

  if (!firebaseId) {
    throw new HttpsError('invalid-argument', 'Firebase ID is required');
  }

  try {
    const convex = getConvexClient();
    const result = await convex.query(api.agents.getAgentByFirebaseId, {
      firebaseId
    });

    if (!result) {
      throw new HttpsError('not-found', 'Agent not found');
    }

    // Check permissions - users can only access public agents or their own agents
    if (!result.public && request.auth && result.creator_id !== request.auth.uid) {
      throw new HttpsError('permission-denied', 'Access denied');
    }

    return {
      success: true,
      result
    };

  } catch (error: any) {
    console.error('Get agent by Firebase ID failed:', error);
    if (error.code) {
      throw error; // Re-throw HttpsError
    }
    throw new HttpsError('internal', `Failed to get agent: ${error.message}`);
  }
}); 