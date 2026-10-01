import type { IconName } from "@/components/ui/Icon";
import type { Issue, RoadStatus } from "@/types/portal";
import type { ReportStatus, ReportType } from "@/types/report";

// Labels and colors exactly as in Ibera Landing v6 (`E`, `TIPOS`, `R[].col`, `FRAG`).

export const ROAD_STATUS: Record<RoadStatus, { label: string; dot: string }> = {
  open: { label: "Transitable", dot: "#00B96C" },
  caution: { label: "Con precaución", dot: "#FACD05" },
  "4x4": { label: "Solo 4×4", dot: "#F68E13" },
};

export const REPORT_TYPE: Record<ReportType, { label: string; icon: IconName }> = {
  dump: { label: "Minibasural", icon: "trash" },
  water: { label: "Agua contaminada", icon: "drop" },
  fire: { label: "Humo o fuego", icon: "fire" },
  wildlife: { label: "Fauna afectada", icon: "eye" },
  other: { label: "Otro", icon: "info" },
};

export const REPORT_STATUS: Record<ReportStatus, { label: string; color: string }> = {
  received: { label: "Recibido", color: "#FACD05" },
  referred: { label: "Derivado", color: "#90B4E1" },
  resolved: { label: "Resuelto", color: "#00B96C" },
};

/** Short issue names used in the portal sheet ("El desafío de esta zona · Residuos") */
export const ISSUE_LABEL: Record<Issue, string> = {
  waste: "Residuos",
  leachate: "Lixiviados",
  fire: "Fuego",
  light: "Luz artificial",
};
