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

export const searchFlows = onCall({
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
    public_only = false,
    status,
    type
  } = request.data;

  if (!query || typeof query !== 'string' || query.trim().length === 0) {
    throw new HttpsError('invalid-argument', 'Search query is required');
  }

  try {
    const convex = getConvexClient();
    let results: any[] = [];

    switch (searchType) {
      case 'name':
        results = await convex.query(api.flows.searchFlows, {
          query: query.trim(),
          creator_id,
          public_only,
          status,
          type
        });
        break;
      
      case 'description':
        results = await convex.query(api.flows.searchFlowsByDescription, {
          query: query.trim(),
          creator_id,
          public_only,
          status,
          type
        });
        break;
      
      case 'full':
      default:
        results = await convex.query(api.flows.searchFlowsFullText, {
          query: query.trim(),
          creator_id,
          public_only,
          status,
          type
        });
        break;
    }

    return {
      success: true,
      results,
      count: results.length
    };

  } catch (error: any) {
    console.error('Search flows failed:', error);
    throw new HttpsError('internal', `Failed to search flows: ${error.message}`);
  }
});

// Get flows by creator using Convex (replacement for Firebase query)
export const getFlowsByCreator = onCall({
  cors: true,
  region: 'us-central1'
}, async (request) => {
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'Authentication required');
  }

  const { creator_id } = request.data;

  if (!creator_id) {
    throw new HttpsError('invalid-argument', 'Creator ID is required');
  }

  try {
    const convex = getConvexClient();
    const results = await convex.query(api.flows.getFlowsByCreator, {
      creator_id
    });

    return {
      success: true,
      results,
      count: results.length
    };

  } catch (error: any) {
    console.error('Get flows by creator failed:', error);
    throw new HttpsError('internal', `Failed to get flows: ${error.message}`);
  }
});

// Get public flows (replacement for Firebase query)
export const getPublicFlows = onCall({
  cors: true,
  region: 'us-central1'
}, async (request) => {
  try {
    const convex = getConvexClient();
    const results = await convex.query(api.flows.getPublicFlows, {});

    return {
      success: true,
      results,
      count: results.length
    };

  } catch (error: any) {
    console.error('Get public flows failed:', error);
    throw new HttpsError('internal', `Failed to get public flows: ${error.message}`);
  }
});

// Get a specific flow by Firebase ID (replacement for Firebase get)
export const getFlowByFirebaseId = onCall({
  cors: true,
  region: 'us-central1'
}, async (request) => {
  const { firebaseId } = request.data;

  if (!firebaseId) {
    throw new HttpsError('invalid-argument', 'Firebase ID is required');
  }

  try {
    const convex = getConvexClient();
    const result = await convex.query(api.flows.getFlowByFirebaseId, {
      firebaseId
    });

    if (!result) {
      throw new HttpsError('not-found', 'Flow not found');
    }

    return {
      success: true,
      result
    };

  } catch (error: any) {
    console.error('Get flow by Firebase ID failed:', error);
    if (error.code === 'not-found') {
      throw error;
    }
    throw new HttpsError('internal', `Failed to get flow: ${error.message}`);
  }
});

// Get active flows by creator
export const getActiveFlowsByCreator = onCall({
  cors: true,
  region: 'us-central1'
}, async (request) => {
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'Authentication required');
  }

  const { creator_id } = request.data;

  if (!creator_id) {
    throw new HttpsError('invalid-argument', 'Creator ID is required');
  }

  try {
    const convex = getConvexClient();
    const results = await convex.query(api.flows.getActiveFlowsByCreator, {
      creator_id
    });

    return {
      success: true,
      results,
      count: results.length
    };

  } catch (error: any) {
    console.error('Get active flows by creator failed:', error);
    throw new HttpsError('internal', `Failed to get active flows: ${error.message}`);
  }
});

// Get draft flows by creator
export const getDraftFlowsByCreator = onCall({
  cors: true,
  region: 'us-central1'
}, async (request) => {
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'Authentication required');
  }

  const { creator_id } = request.data;

  if (!creator_id) {
    throw new HttpsError('invalid-argument', 'Creator ID is required');
  }

  try {
    const convex = getConvexClient();
    const results = await convex.query(api.flows.getDraftFlowsByCreator, {
      creator_id
    });

    return {
      success: true,
      results,
      count: results.length
    };

  } catch (error: any) {
    console.error('Get draft flows by creator failed:', error);
    throw new HttpsError('internal', `Failed to get draft flows: ${error.message}`);
  }
});
