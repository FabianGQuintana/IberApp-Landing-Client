export type ReportType = "dump" | "water" | "fire" | "wildlife" | "other";
export type ReportStatus = "received" | "referred" | "resolved";

export interface Report {
  code: string; // "IB-0427"
  title: string;
  type: ReportType;
  status: ReportStatus;
  place: string;
  /** Display date as in the prototype ("hoy", "ayer", "2 sep") or ISO for new reports */
  date: string;
  lat: number;
  lng: number;
  note?: string;
  photo?: string;
  /** true for the report created by the current visitor */
  mine?: boolean;
}
