import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { getAgentsIndex } from "../search/upstash";
import { goals_db } from "../init";


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
    const index = getAgentsIndex();
    const filterParts: string[] = [];
    if (creator_id) filterParts.push(`creator_id = '${creator_id}'`);
    if (public_only !== undefined) filterParts.push(`public = ${public_only}`);

    const searchRes: any = await index.search({
      query: query.trim(),
      filter: filterParts.length ? filterParts.join(" AND ") : undefined,
      limit: 50,
    });
    const documents = (searchRes && (searchRes.documents || searchRes.results || searchRes.hits))
      || (Array.isArray(searchRes) ? searchRes : []);
    const results = documents.map((d: any) => ({ id: d.id, ...(d.content || {}), ...(d.metadata || {}) }));

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
    const snapshot = await goals_db
      .collection('agents')
      .where('creator_id', '==', creator_id || requesterId)
      .get();
    const results = snapshot.docs.map((doc: any) => ({ id: doc.id, ...doc.data() }));
    return { success: true, results, count: results.length };
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
    const snapshot = await goals_db
      .collection('agents')
      .where('public', '==', true)
      .get();
    const results = snapshot.docs.map((doc: any) => ({ id: doc.id, ...doc.data() }));
    return { success: true, results, count: results.length };
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
    const doc = await goals_db.collection('agents').doc(firebaseId).get();
    if (!doc.exists) {
      throw new HttpsError('not-found', 'Agent not found');
    }
    const result = { id: doc.id, ...doc.data() } as any;
    if (!result.public && request.auth && result.creator_id !== request.auth.uid) {
      throw new HttpsError('permission-denied', 'Access denied');
    }
    return { success: true, result };
  } catch (error: any) {
    console.error('Get agent by Firebase ID failed:', error);
    if (error.code) {
      throw error; // Re-throw HttpsError
    }
    throw new HttpsError('internal', `Failed to get agent: ${error.message}`);
  }
}); 