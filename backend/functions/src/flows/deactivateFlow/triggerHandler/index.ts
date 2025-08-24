import { HttpsError } from "firebase-functions/v2/https";
import { handleDeactivateScheduleTimeTrigger } from "./deactiveScheduleTime";
import { handleDeactivateScheduleIntervalTrigger } from "./deactiveScheduleInterval";
import { handleDeactivateEmailTrigger } from "./deactivateEmailTrigger";


export const handleFlowTrigger = async (flowData, userId) => {
    const { trigger } = flowData;
    const { node_id } = trigger;

    switch (node_id) {
        case 'SCHEDULE_TIME':
            return await handleDeactivateScheduleTimeTrigger(flowData, userId);
        case 'SCHEDULE_INTERVAL':
            return await handleDeactivateScheduleIntervalTrigger(flowData, userId);
        case 'EMAIL_TRIGGER':
            return await handleDeactivateEmailTrigger(flowData, userId);
        default:
            throw new HttpsError('unimplemented', `Trigger type ${node_id} is not implemented yet`);
    }



}

