import { onSchedule } from 'firebase-functions/v2/scheduler'
import { goals_db } from '../init'

/**
 * Scheduled function to clean up expired processed message records
 * Runs every 6 hours to remove messages older than 24 hours
 */
export const cleanupProcessedMessages = onSchedule({
    schedule: 'every 6 hours',
    region: 'us-central1',
    timeZone: 'UTC'
}, async (event) => {
    try {
        console.log('Starting cleanup of expired processed messages...');
        
        const now = new Date();
        const cutoffTime = new Date(now.getTime() - (24 * 60 * 60 * 1000)); // 24 hours ago
        
        // Query for expired messages
        const expiredMessagesQuery = goals_db.collection('processed_messages')
            .where('expires_at', '<=', cutoffTime)
            .limit(500); // Process in batches to avoid timeouts
        
        const snapshot = await expiredMessagesQuery.get();
        
        if (snapshot.empty) {
            console.log('No expired processed messages to clean up');
            return;
        }
        
        console.log(`Found ${snapshot.size} expired processed messages to delete`);
        
        // Batch delete for better performance
        const batch = goals_db.batch();
        
        snapshot.docs.forEach((doc) => {
            batch.delete(doc.ref);
        });
        
        await batch.commit();
        
        console.log(`Successfully cleaned up ${snapshot.size} expired processed messages`);
        
    } catch (error) {
        console.error('Error during processed messages cleanup:', error);
        // Don't throw - we don't want the scheduler to retry cleanup failures
    }
}); 