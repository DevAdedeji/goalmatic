import { onDocumentCreated, onDocumentUpdated, onDocumentDeleted } from 'firebase-functions/v2/firestore';
import { api } from '../../convex/src/_generated/api';
import { goals_db_string } from '../init';
import { getConvexClient, convertTimestamp } from './utils';

// Transform Firebase table data to Convex format
const transformTableForConvex = (firebaseId: string, data: any) => {
  return {
    firebaseId,
    name: data.name || '',
    description: data.description || '',
    type: data.type || 'default',
    fields: data.fields || [],
    creator_id: data.creator_id || '',
    visibility: data.visibility || 'private',
    allowed_users: data.allowed_users || [],
    created_at: convertTimestamp(data.created_at),
    updated_at: convertTimestamp(data.updated_at)
  };
};

// Sync table creation from Firebase to Convex
export const convexSyncTableCreate = onDocumentCreated({
  document: 'tables/{tableId}',
  database: goals_db_string,
}, async (event) => {
  console.log('convexSyncTableCreate triggered for:', event.params.tableId);
  try {
    const tableId = event.params.tableId;
    const tableData = event.data?.data();
    
    if (!tableData) {
      console.error('No table data found for creation sync');
      return;
    }

    // Validate required fields
    if (!tableData.name || !tableData.creator_id) {
      console.error('Missing required fields in table data:', { name: tableData.name, creator_id: tableData.creator_id });
      return;
    }

    const convex = getConvexClient();
    
    // Check if table already exists (in case of race condition)
    const existingTable = await convex.query(api.tables.getTableByFirebaseId, {
      firebaseId: tableId
    });
    
    if (existingTable) {
      console.log(`Table ${tableId} already exists in Convex, skipping creation`);
      return;
    }
    
    const convexData = transformTableForConvex(tableId, tableData);
    
    console.log('Sending table data to Convex:', JSON.stringify(convexData, null, 2));
    
    await convex.mutation(api.tables.createTable, convexData);
    
    console.log(`Successfully synced table creation to Convex: ${tableId}`);
  } catch (error) {
    console.error('Error syncing table creation to Convex:', error);
    console.error('Event data:', JSON.stringify(event.data?.data(), null, 2));
    // Don't throw error to avoid Firebase function retries
  }
});

// Sync table updates from Firebase to Convex
export const convexSyncTableUpdate = onDocumentUpdated({
  document: 'tables/{tableId}',
  database: goals_db_string,
}, async (event) => {
  console.log('convexSyncTableUpdate triggered for:', event.params.tableId);
  try {
    const tableId = event.params.tableId;
    const beforeData = event.data?.before.data();
    const afterData = event.data?.after.data();
    
    if (!afterData) {
      console.error('No table data found for update sync');
      return;
    }

    // Check if this update came from Convex to avoid circular sync
    if (afterData._convexSyncSkip) {
      console.log(`Skipping Firebase->Convex sync for ${tableId} (originated from Convex)`);
      return;
    }

    const convex = getConvexClient();
    
    // Check if table exists in Convex
    const existingTable = await convex.query(api.tables.getTableByFirebaseId, {
      firebaseId: tableId
    });
    
    if (!existingTable) {
      console.log(`Table ${tableId} not found in Convex during update, creating first...`);
      
      // Validate required fields for creation
      if (!afterData.name || !afterData.creator_id) {
        console.error('Cannot create table during update - missing required fields:', { 
          name: afterData.name, 
          creator_id: afterData.creator_id 
        });
        return;
      }
      
      // Create the table first (upsert pattern)
      const convexData = transformTableForConvex(tableId, afterData);
      await convex.mutation(api.tables.createTable, convexData);
      console.log(`Successfully created table during update sync: ${tableId}`);
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
    if (JSON.stringify(beforeData?.fields) !== JSON.stringify(afterData.fields)) {
      updates.fields = afterData.fields;
    }
    if (beforeData?.visibility !== afterData.visibility) {
      updates.visibility = afterData.visibility;
    }
    if (JSON.stringify(beforeData?.allowed_users) !== JSON.stringify(afterData.allowed_users)) {
      updates.allowed_users = afterData.allowed_users;
    }

    await convex.mutation(api.tables.updateTable, {
      firebaseId: tableId,
      updates
    });
    
    console.log(`Successfully synced table update to Convex: ${tableId}`);
  } catch (error) {
    console.error('Error syncing table update to Convex:', error);
    // Don't throw error to avoid Firebase function retries
  }
});

// Sync table deletion from Firebase to Convex
export const convexSyncTableDelete = onDocumentDeleted({
  document: 'tables/{tableId}',
  database: goals_db_string,
}, async (event) => {
  try {
    const tableId = event.params.tableId;
    
    const convex = getConvexClient();
    await convex.mutation(api.tables.deleteTable, {
      firebaseId: tableId
    });
    
    console.log(`Successfully synced table deletion to Convex: ${tableId}`);
  } catch (error) {
    console.error('Error syncing table deletion to Convex:', error);
    // Don't throw error to avoid Firebase function retries
  }
}); 