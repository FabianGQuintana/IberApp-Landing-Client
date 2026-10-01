import type { RoadStatus } from "@/types/portal";

// Source: `ROAD_STATUS` in Ibera Landing v6. Kept apart from portals because it changes daily.
// SAMPLE DATA until park rangers publish the real status (phase 6).
export const ROAD_STATUS_SOURCE = {
  source: "Estado de caminos de accesos",
  updated: "Hoy 08:40 · guardaparques",
  updatedSentence: "Actualizado hoy a las 08:40 por guardaparques.",
};

export const ROAD_STATUS_BY_PORTAL: Record<string, RoadStatus> = {
  laguna: "open",
  cambyreta: "open",
  sannicolas: "4x4",
  uguay: "open",
  galarza: "caution",
  carambola: "open",
  sanantonio: "open",
  mburucuya: "open",
};
