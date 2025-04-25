import {  HttpsError } from 'firebase-functions/v2/https';
import { goals_db } from '../../init';

export const validateFlowTrigger = async (request) => {
      if (!request.auth) {
        throw new HttpsError('unauthenticated', 'Unauthorized');
      }

      const { flowId } = request.data;

      if (!flowId) {
        throw new HttpsError('invalid-argument', 'Missing required parameter: flowId');
      }

      // Get the flow data
      const flowDoc = await goals_db.collection('flows').doc(flowId).get();
      
      if (!flowDoc.exists) {
        throw new HttpsError('not-found', 'Flow not found');
      }

      const flowData = flowDoc.data();

      // Verify that the flow belongs to the user making the request
      if (flowData?.creator_id !== request.auth.uid) {
        throw new HttpsError('permission-denied', 'You do not have permission to activate this flow');
      }

      // Check if the flow has a trigger
      if (!flowData?.trigger) {
        throw new HttpsError('failed-precondition', 'Flow must have a trigger to be activated');
      }

      const { trigger } = flowData;
      
      // Check if the flow has steps
      if (!flowData?.steps || flowData.steps.length === 0) {
        throw new HttpsError('failed-precondition', 'Flow must have at least one step to be activated');
      }
    
    return {
        flowData,
        trigger,
        steps: flowData.steps
    }
}