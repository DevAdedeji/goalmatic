import { onSchedule } from 'firebase-functions/v2/scheduler';
import { goals_db } from '../init';
import { Timestamp } from 'firebase-admin/firestore';

/**
 * Scheduled function to clean up old email trigger logs
 * Runs every 6 hours to remove logs older than 24 hours
 */
export const cleanupEmailTriggerLogs = onSchedule({
  schedule: 'every 6 hours',
  region: 'us-central1',
  timeZone: 'UTC',
  memory: '256MiB',
  maxInstances: 1
}, async (_event) => {
  try {
    console.log('Starting email trigger logs cleanup...');
    
    // Calculate cutoff time (24 hours ago)
    const now = new Date();
    const cutoffTime = new Date(now.getTime() - (24 * 60 * 60 * 1000)); // 24 hours ago
    const cutoffTimestamp = Timestamp.fromDate(cutoffTime);
    
    console.log(`Cleaning up logs older than: ${cutoffTime.toISOString()}`);
    
    // Query for old logs
    const oldLogsQuery = goals_db.collection('emailTriggerLogs')
      .where('created_at', '<', cutoffTimestamp)
      .limit(500); // Process in batches to avoid timeouts
    
    const snapshot = await oldLogsQuery.get();
    
    if (snapshot.empty) {
      console.log('No old email trigger logs found to clean up');
      return;
    }
    
    console.log(`Found ${snapshot.docs.length} old email trigger logs to delete`);
    
    // Delete logs in batches
    const batch = goals_db.batch();
    let deleteCount = 0;
    
    snapshot.docs.forEach((doc) => {
      batch.delete(doc.ref);
      deleteCount++;
    });
    
    // Commit the batch delete
    await batch.commit();
    
    console.log(`Successfully deleted ${deleteCount} old email trigger logs`);
    
    // If we hit the limit, there might be more logs to clean up
    if (snapshot.docs.length === 500) {
      console.log('Batch limit reached, there may be more logs to clean up in the next run');
    }
    
  } catch (error) {
    console.error('Error during email trigger logs cleanup:', error);
    throw error; // Re-throw to mark the function as failed
  }
});

/**
 * Manual cleanup function that can be called by other functions
 * Useful for cleaning up logs for a specific trigger
 */
export async function cleanupLogsForTrigger(triggerId: string, olderThanHours: number = 24): Promise<number> {
  try {
    const cutoffTime = new Date();
    cutoffTime.setHours(cutoffTime.getHours() - olderThanHours);
    const cutoffTimestamp = Timestamp.fromDate(cutoffTime);
    
    const oldLogsQuery = goals_db.collection('emailTriggerLogs')
      .where('trigger_id', '==', triggerId)
      .where('created_at', '<', cutoffTimestamp)
      .limit(100); // Smaller batch for manual cleanup
    
    const snapshot = await oldLogsQuery.get();
    
    if (snapshot.empty) {
      return 0;
    }
    
    const batch = goals_db.batch();
    snapshot.docs.forEach((doc) => {
      batch.delete(doc.ref);
    });
    
    await batch.commit();
    
    console.log(`Cleaned up ${snapshot.docs.length} logs for trigger ${triggerId}`);
    return snapshot.docs.length;
    
  } catch (error) {
    console.error(`Error cleaning up logs for trigger ${triggerId}:`, error);
    throw error;
  }
}

/**
 * Get statistics about email trigger logs
 * Useful for monitoring and debugging
 */
export async function getEmailTriggerLogsStats(): Promise<{
  totalLogs: number;
  logsByStatus: Record<string, number>;
  oldestLog?: Date;
  newestLog?: Date;
}> {
  try {
    // Get total count and status breakdown
    const allLogsSnapshot = await goals_db.collection('emailTriggerLogs').get();
    
    const stats = {
      totalLogs: allLogsSnapshot.size,
      logsByStatus: {} as Record<string, number>,
      oldestLog: undefined as Date | undefined,
      newestLog: undefined as Date | undefined
    };
    
    let oldestTimestamp: Timestamp | null = null;
    let newestTimestamp: Timestamp | null = null;
    
    allLogsSnapshot.docs.forEach((doc) => {
      const data = doc.data();
      
      // Count by status
      const status = data.status || 'unknown';
      stats.logsByStatus[status] = (stats.logsByStatus[status] || 0) + 1;
      
      // Track oldest and newest
      const createdAt = data.created_at as Timestamp;
      if (createdAt) {
        if (!oldestTimestamp || createdAt.toMillis() < oldestTimestamp.toMillis()) {
          oldestTimestamp = createdAt;
        }
        if (!newestTimestamp || createdAt.toMillis() > newestTimestamp.toMillis()) {
          newestTimestamp = createdAt;
        }
      }
    });
    
    if (oldestTimestamp !== null) {
      stats.oldestLog = (oldestTimestamp as Timestamp).toDate();
    }
    if (newestTimestamp !== null) {
      stats.newestLog = (newestTimestamp as Timestamp).toDate();
    }
    
    return stats;
    
  } catch (error) {
    console.error('Error getting email trigger logs stats:', error);
    throw error;
  }
}
