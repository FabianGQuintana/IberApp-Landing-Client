import type { Report } from "@/types/report";

// SAMPLE DATA. Source: `static R` in Ibera Landing v6. Replaced by the database in phase 6.
export const SAMPLE_REPORTS: Report[] = [
  { code: "IB-0401", title: "Bolsas en la costanera", type: "dump", status: "resolved", place: "Laguna Iberá", date: "2 sep", lat: -28.5372, lng: -57.1718 },
  { code: "IB-0402", title: "Humo en pastizal", type: "fire", status: "received", place: "Galarza", date: "hoy", lat: -28.118, lng: -56.73 },
  { code: "IB-0403", title: "Descampado junto al arroyo", type: "dump", status: "referred", place: "Laguna Iberá", date: "12 sep", lat: -28.523, lng: -57.215 },
  { code: "IB-0404", title: "Agua oscura cerca del basural", type: "water", status: "referred", place: "San Antonio", date: "9 sep", lat: -27.874, lng: -57.36 },
  { code: "IB-0405", title: "Restos de camping", type: "dump", status: "received", place: "Uguay", date: "ayer", lat: -28.649, lng: -57.47 },
];

/** Tracking steps shown after sending (v6: `track`) */
export const TRACKING_STEPS = [
  { status: "Recibido", detail: "Hoy · Guardaparques Laguna Iberá" },
  { status: "Derivado", detail: "Pendiente · Municipio de Colonia Carlos Pellegrini" },
  { status: "Resuelto", detail: "Pendiente" },
];
