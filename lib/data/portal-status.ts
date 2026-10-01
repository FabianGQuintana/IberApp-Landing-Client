import { ROAD_STATUS_BY_PORTAL } from "./road-status";
import { ROAD_STATUS } from "./statuses";

/** Road status label and dot color for a portal (v6 merges `ROAD_STATUS.byId` + `E`). */
export const roadStatusOf = (portalId: string) => ROAD_STATUS[ROAD_STATUS_BY_PORTAL[portalId] ?? "open"];
