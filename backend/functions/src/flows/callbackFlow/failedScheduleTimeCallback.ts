import { onRequest } from 'firebase-functions/v2/https';
import { goals_db } from '../../init';
import { logger } from 'firebase-functions';
import { Request } from 'firebase-functions/v2/https';
import { Timestamp } from 'firebase-admin/firestore';
import { notifyUserOnFlowFailure } from '../../helpers/flowFailureNotifier';

interface FailurePayload {
  flowId?: string;
  executionId?: string;
  userId?: string;
  [key: string]: any;
}

/**
 * Handler for QStash failure callbacks
 * This function receives notification when a scheduled flow execution fails
 * and updates the flow status and adds error information
 */
export const failedScheduleTimeCallback = onRequest(
  { cors: true, region: 'us-central1' },
  async (req: Request, res: any) => {
    try {
      if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
      }
        

      // Extract failure data from QStash failure callback payload
      const {
        sourceMessageId,
        status,
        retried,
        maxRetries,
        dlqId,
        body: encodedBody,
        sourceBody: encodedSourceBody
      } = req.body;

      if (!sourceMessageId) {
        logger.error('Missing sourceMessageId in failure callback', req.body);
        return res.status(400).json({ error: 'Missing sourceMessageId' });
      }

      // Decode the base64 encoded body if present
      let decodedBody = {};
      let payload: FailurePayload = {};
      
      try {
        if (encodedBody) {
          decodedBody = JSON.parse(Buffer.from(encodedBody, 'base64').toString());
        }
        
        if (encodedSourceBody) {
          payload = JSON.parse(Buffer.from(encodedSourceBody, 'base64').toString());
        }
      } catch (error) {
        logger.error('Error decoding body', error);
      }

      const { flowId, executionId, userId } = payload;

      if (!flowId || !executionId) {
        logger.error('Missing required fields in source payload', payload);
        return res.status(400).json({ error: 'Missing required fields in source payload' });
      }

      // Query the flow
      const flowRef = goals_db.collection('flows').doc(flowId);
      const flowDoc = await flowRef.get();

      if (!flowDoc.exists) {
        logger.error(`Flow ${flowId} not found`);
        return res.status(404).json({ error: 'Flow not found' });
      }

      // Update flow status to failed
      await flowRef.update({
        status: 0, // not active
        lastError: {
          timestamp: new Date().toISOString(),
          sourceMessageId,
          status,
          retried,
          maxRetries,
          dlqId,
          errorDetails: decodedBody
        }
      });

      try {
        // Create a new run document for the failed execution in the runs subcollection
        const runRef = flowRef.collection('logs').doc(executionId);
        const currentTime = new Date();
        
        await runRef.set({
          id: executionId,
          status: 'failed',
          start_time: Timestamp.fromDate(currentTime),
          end_time: Timestamp.fromDate(currentTime),
          duration: '0s', // 0s is appropriate for callback failures as they never actually executed
          error: `Message delivery failed with status ${status} after ${retried} retries`,
          dlqId,
          created_at: Timestamp.fromDate(currentTime),
          creator_id: userId || 'system',
          steps: 0
        });
      } catch (runError) {
        // Log but don't fail the entire operation if creating run document fails
        logger.error(`Error creating run document for failed flow ${flowId}:`, runError);
      }

      // Try notifying the user if we have one
      try {
        if (userId) {
          const flowName = flowDoc.data()?.name as string | undefined;
          await notifyUserOnFlowFailure({
            userId,
            flowId,
            executionId,
            errorMessage: `Scheduled execution failed with status ${status}.`,
            flowName,
          });
        }
      } catch (notifyErr) {
        logger.error('Error notifying user on scheduled failure:', notifyErr);
      }

      // Return success response
      return res.status(200).json({
        success: true,
        message: 'Failure callback processed successfully',
        flowId,
        executionId,
        dlqId
      });
    } catch (error) {
      logger.error('Error processing failure callback:', error);
      return res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
);
