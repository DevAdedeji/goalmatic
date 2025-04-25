import { HttpsError } from "firebase-functions/v2/https";
import { handleActivateScheduleTimeTrigger } from "./activateScheduleTime";


export const handleFlowTrigger = async (flowData, userId) => {
    const { trigger } = flowData;
    const { node_id } = trigger;

    switch (node_id) {
        case 'SCHEDULE_TIME':
            return await handleActivateScheduleTimeTrigger(flowData, userId);
        default:
            throw new HttpsError('unimplemented', `Trigger type ${node_id} is not implemented yet`);
    }



}

