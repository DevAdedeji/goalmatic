import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { getConvexClient } from '../convex/utils';
import { api } from '../../convex/src/_generated/api';
import { goals_db } from '../init';

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

// Get flows by creator from backend server (Firestore) instead of Convex
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
    // Fetch flows by creator directly from Firestore instead of Convex
    const flowsSnapshot = await goals_db
      .collection('flows')
      .where('creator_id', '==', creator_id)
      .get();

    const results = flowsSnapshot.docs.map((doc: any) => ({
      id: doc.id,
      ...doc.data()
    }));

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

// Get public flows from backend server (Firestore) instead of Convex
export const getPublicFlows = onCall({
  cors: true,
  region: 'us-central1'
}, async () => {
  try {
    // Fetch public flows directly from Firestore instead of Convex
    const publicFlowsSnapshot = await goals_db
      .collection('flows')
      .where('public', '==', true)
      .get();

    const results = publicFlowsSnapshot.docs.map((doc: any) => ({
      id: doc.id,
      ...doc.data()
    }));

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

// Get a specific flow by Firebase ID from backend server (Firestore) instead of Convex
export const getFlowByFirebaseId = onCall({
  cors: true,
  region: 'us-central1'
}, async (request) => {
  const { firebaseId } = request.data;

  if (!firebaseId) {
    throw new HttpsError('invalid-argument', 'Firebase ID is required');
  }

  try {
    // Fetch flow directly from Firestore instead of Convex
    const flowDoc = await goals_db
      .collection('flows')
      .doc(firebaseId)
      .get();

    if (!flowDoc.exists) {
      throw new HttpsError('not-found', 'Flow not found');
    }

    const result = {
      id: flowDoc.id,
      ...flowDoc.data()
    };

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

// Get active flows by creator from backend server (Firestore) instead of Convex
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
    // Fetch active flows by creator directly from Firestore instead of Convex
    const flowsSnapshot = await goals_db
      .collection('flows')
      .where('creator_id', '==', creator_id)
      .where('status', '==', 1) // Active status
      .get();

    const results = flowsSnapshot.docs.map((doc: any) => ({
      id: doc.id,
      ...doc.data()
    }));

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

// Get draft flows by creator from backend server (Firestore) instead of Convex
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
    // Fetch draft flows by creator directly from Firestore instead of Convex
    const flowsSnapshot = await goals_db
      .collection('flows')
      .where('creator_id', '==', creator_id)
      .where('status', '==', 0) // Draft status
      .get();

    const results = flowsSnapshot.docs.map((doc: any) => ({
      id: doc.id,
      ...doc.data()
    }));

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
