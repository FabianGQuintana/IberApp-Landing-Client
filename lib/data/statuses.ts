import type { Issue, RoadStatus } from "@/types/portal";

// Labels and colors exactly as in Ibera Landing v6 (`E`, `TIPOS`, `R[].col`, `FRAG`).

export const ROAD_STATUS: Record<RoadStatus, { label: string; dot: string }> = {
  open: { label: "Transitable", dot: "#00B96C" },
  caution: { label: "Con precaución", dot: "#FACD05" },
  "4x4": { label: "Solo 4×4", dot: "#F68E13" },
};

/** Short issue names used in the portal sheet ("El desafío de esta zona · Residuos") */
export const ISSUE_LABEL: Record<Issue, string> = {
  waste: "Residuos",
  leachate: "Lixiviados",
  fire: "Fuego",
  light: "Luz artificial",
};
