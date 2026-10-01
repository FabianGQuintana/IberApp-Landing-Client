import { z } from "zod";
import { REPORT_AREA } from "@/lib/map/config";

// Shared by the client wizard and (phase 4) the Server Action.
export const reportInputSchema = z.object({
  type: z.enum(["dump", "water", "fire", "wildlife", "other"], { error: "Elegí qué encontraste." }),
  lat: z.number().min(REPORT_AREA.minLat).max(REPORT_AREA.maxLat),
  lng: z.number().min(REPORT_AREA.minLng).max(REPORT_AREA.maxLng),
  note: z.string().trim().max(500, "La nota puede tener hasta 500 caracteres.").optional(),
  portalId: z.string().optional(),
  photo: z.string().optional(),
});

export type ReportInput = z.infer<typeof reportInputSchema>;

export const OUT_OF_AREA_MESSAGE = "La ubicación está fuera del área del Iberá. Mové el mapa hasta el lugar del incidente.";
