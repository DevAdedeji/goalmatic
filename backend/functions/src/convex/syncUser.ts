import { onDocumentCreated, onDocumentUpdated, onDocumentDeleted } from 'firebase-functions/v2/firestore';
import { api } from '../../convex/src/_generated/api';
import { goals_db_string, isConvexSyncEnabled } from '../init';
import { getConvexClient, convertTimestamp } from './utils';

// Transform Firebase user data to Convex format
const transformUserForConvex = (firebaseId: string, data: any) => {
  return {
    firebaseId,
    username: data.username || '',
    name: data.name || '',
    bio: data.bio,
    email: data.email,
    phone: data.phone,
    photo_url: data.photo_url,
    referral_code: data.referral_code,
    referred_by: data.referred_by,
    created_at: convertTimestamp(data.created_at),
    updated_at: convertTimestamp(data.updated_at),
    showLogs: data.showLogs,
    selected_agent_id: data.selected_agent_id,
    timezone: data.timezone,
    signup_method: data.signup_method,
    phone_verified: data.phone_verified
  };
};

// Sync user creation from Firebase to Convex
export const convexSyncUserCreate = onDocumentCreated({
  document: 'users/{userId}',
  database: goals_db_string,
}, async (event) => {

  // Check if Convex sync is enabled
  if (!isConvexSyncEnabled()) {
    return;
  }

  try {
    const userId = event.params.userId;
    const userData = event.data?.data();

    if (!userData) {
      console.error('No user data found for creation sync');
      return;
    }

    // Validate required fields
    if (!userData.name || !userData.username) {
      console.error('Missing required fields in user data:', { name: userData.name, username: userData.username });
      return;
    }

    const convex = getConvexClient();

    // Check if user already exists (in case of race condition)
    const existingUser = await convex.query(api.users.getUserByFirebaseId, {
      firebaseId: userId
    });

    if (existingUser) {
      return;
    }

    const convexData = transformUserForConvex(userId, userData);


    await convex.mutation(api.users.createUser, convexData);

  } catch (error) {
    console.error('Error syncing user creation to Convex:', error);
    console.error('Event data:', JSON.stringify(event.data?.data(), null, 2));
    // Don't throw error to avoid Firebase function retries
  }
});

// Sync user updates from Firebase to Convex
export const convexSyncUserUpdate = onDocumentUpdated({
  document: 'users/{userId}',
  database: goals_db_string,
}, async (event) => {

  // Check if Convex sync is enabled
  if (!isConvexSyncEnabled()) {
    return;
  }

  try {
    const userId = event.params.userId;
    const beforeData = event.data?.before.data();
    const afterData = event.data?.after.data();

    if (!afterData) {
      console.error('No user data found for update sync');
      return;
    }

    // Check if this update came from Convex to avoid circular sync
    if (afterData._convexSyncSkip) {
      return;
    }

    const convex = getConvexClient();

    // Check if user exists in Convex
    const existingUser = await convex.query(api.users.getUserByFirebaseId, {
      firebaseId: userId
    });

    if (!existingUser) {

      // Validate required fields for creation
      if (!afterData.name || !afterData.username) {
        console.error('Cannot create user during update - missing required fields:', {
          name: afterData.name,
          username: afterData.username
        });
        return;
      }

      // Create the user first (upsert pattern)
      const convexData = transformUserForConvex(userId, afterData);
      await convex.mutation(api.users.createUser, convexData);
      return;
    }

    // Prepare update data - only include fields that have changed
    const updates: any = {
      updated_at: convertTimestamp(afterData.updated_at)
    };

    if (beforeData?.username !== afterData.username) {
      updates.username = afterData.username;
    }
    if (beforeData?.name !== afterData.name) {
      updates.name = afterData.name;
    }
    if (beforeData?.bio !== afterData.bio) {
      updates.bio = afterData.bio;
    }
    if (beforeData?.email !== afterData.email) {
      updates.email = afterData.email;
    }
    if (beforeData?.phone !== afterData.phone) {
      updates.phone = afterData.phone;
    }
    if (beforeData?.photo_url !== afterData.photo_url) {
      updates.photo_url = afterData.photo_url;
    }
    if (beforeData?.referral_code !== afterData.referral_code) {
      updates.referral_code = afterData.referral_code;
    }
    if (beforeData?.referred_by !== afterData.referred_by) {
      updates.referred_by = afterData.referred_by;
    }
    if (beforeData?.showLogs !== afterData.showLogs) {
      updates.showLogs = afterData.showLogs;
    }
    if (beforeData?.selected_agent_id !== afterData.selected_agent_id) {
      updates.selected_agent_id = afterData.selected_agent_id;
    }
    if (beforeData?.timezone !== afterData.timezone) {
      updates.timezone = afterData.timezone;
    }
    if (beforeData?.signup_method !== afterData.signup_method) {
      updates.signup_method = afterData.signup_method;
    }
    if (beforeData?.phone_verified !== afterData.phone_verified) {
      updates.phone_verified = afterData.phone_verified;
    }

    await convex.mutation(api.users.updateUser, {
      firebaseId: userId,
      updates
    });

  } catch (error) {
    console.error('Error syncing user update to Convex:', error);
    // Don't throw error to avoid Firebase function retries
  }
});

// Sync user deletion from Firebase to Convex
export const convexSyncUserDelete = onDocumentDeleted({
  document: 'users/{userId}',
  database: goals_db_string,
}, async (event) => {

  // Check if Convex sync is enabled
  if (!isConvexSyncEnabled()) {
    return;
  }

  try {
    const userId = event.params.userId;

    const convex = getConvexClient();
    await convex.mutation(api.users.deleteUser, {
      firebaseId: userId
    });

  } catch (error) {
    console.error('Error syncing user deletion to Convex:', error);
    // Don't throw error to avoid Firebase function retries
  }
}); 