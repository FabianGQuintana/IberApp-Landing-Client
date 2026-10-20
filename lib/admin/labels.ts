import type { ReportStatus, SeverityLevel } from "@/types/admin/report";

// Spanish labels and palette colors (app/globals.css) for the backend enums.
// The colors are for dots and fills next to the label: yellow text is unreadable on the light theme.

export const REPORT_STATUS: Record<ReportStatus, { label: string; color: string }> = {
  Pending: { label: "Pendiente", color: "#FACD05" },
  Done: { label: "Resuelto", color: "#00B96C" },
  Canceled: { label: "Cancelado", color: "#8FA89A" },
};

/** rank follows SeverityLevelReport (0 = Low … 4 = Emergency), to sort by severity */
export const SEVERITY: Record<SeverityLevel, { label: string; color: string; rank: number }> = {
  Low: { label: "Baja", color: "#8FA89A", rank: 0 },
  Moderate: { label: "Moderada", color: "#90B4E1", rank: 1 },
  High: { label: "Alta", color: "#FACD05", rank: 2 },
  Critical: { label: "Crítica", color: "#F68E13", rank: 3 },
  Emergency: { label: "Emergencia", color: "#E5484D", rank: 4 },
};
