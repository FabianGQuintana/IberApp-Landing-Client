import { z } from "zod";
import type { SeverityLevel } from "@/types/admin/report";

// Same rules as the backend's CreateReportCategoryValidator, with the app's wording.
export const CATEGORY_NAME_MAX = 100;
export const CATEGORY_DESCRIPTION_MAX = 500;

/** From the mildest to the most serious, as the form offers them */
export const SEVERITY_LEVELS = ["Low", "Moderate", "High", "Critical", "Emergency"] as const satisfies readonly SeverityLevel[];

export const categoryInputSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Escribí un nombre para la categoría.")
    .max(CATEGORY_NAME_MAX, `El nombre puede tener hasta ${CATEGORY_NAME_MAX} caracteres.`),
  description: z
    .string()
    .trim()
    .max(CATEGORY_DESCRIPTION_MAX, `La descripción puede tener hasta ${CATEGORY_DESCRIPTION_MAX} caracteres.`),
  severityLevel: z.enum(SEVERITY_LEVELS, { error: "Elegí la gravedad de la categoría." }),
});

export type CategoryFieldErrors = Partial<Record<keyof z.infer<typeof categoryInputSchema>, string>>;
