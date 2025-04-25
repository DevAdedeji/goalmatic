import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { validateFlowTrigger } from './validate';
import { handleFlowTrigger } from './triggerHandler';



export const activateFlow = onCall({cors: true, region: 'us-central1'}, async (request) => {
    try {
        const { flowData } = await validateFlowTrigger(request);

        return await handleFlowTrigger(flowData, request.auth?.uid);

    } catch (error) {
      console.error('Error in activateFlow:', error);
      throw new HttpsError('internal', `${error}`);
    }
  }
);


