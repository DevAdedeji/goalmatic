import { HttpsError } from "firebase-functions/v2/https";
import { handleActivateScheduleTimeTrigger } from "./activateScheduleTime";
import { handleActivateScheduleIntervalTrigger } from "./activateScheduleInterval";
import { handleActivateEmailTrigger } from "./activateEmailTrigger";

export const handleFlowTrigger = async (flowData, userId) => {
  const { trigger } = flowData;
  const { node_id } = trigger;

  switch (node_id) {
    case "SCHEDULE_TIME":
      return await handleActivateScheduleTimeTrigger(flowData, userId);
    case "SCHEDULE_INTERVAL":
      return await handleActivateScheduleIntervalTrigger(flowData, userId);
    case "EMAIL_TRIGGER":
      return await handleActivateEmailTrigger(flowData, userId);
    default:
      throw new HttpsError(
        "unimplemented",
        `Trigger type ${node_id} is not implemented yet`,
      );
  }
};
