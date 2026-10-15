import { z } from "zod";
import { PORTALS } from "@/lib/data/portals";
import type { FeedbackKind } from "@/types/feedback";

export const FEEDBACK_MESSAGE_MAX = 1000;
/** Limit of the original file; it is compressed to ~300 KB before sending. */
export const FEEDBACK_PHOTO_MAX_MB = 15;
export const FEEDBACK_PHOTO_TYPES = ["image/jpeg", "image/png", "image/webp"];

export const FEEDBACK_KINDS: { id: FeedbackKind; label: string; hint: string }[] = [
  { id: "review", label: "Reseña", hint: "Contá cómo fue tu visita." },
  { id: "suggestion", label: "Sugerencia", hint: "¿Qué mejorarías en el portal?" },
  { id: "complaint", label: "Queja", hint: "Se deriva al equipo del portal para resolverla." },
];

const portalIds = PORTALS.map((p) => p.id) as [string, ...string[]];

/** Local YYYY-MM-DD (the visitor's day, not UTC) */
export const toDateInput = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

export const visitDateBounds = () => {
  const today = new Date();
  const min = new Date(today);
  min.setFullYear(today.getFullYear() - 1);
  return { min: toDateInput(min), max: toDateInput(today) };
};

// Shared by the modal and, later, the backend contract.
export const feedbackInputSchema = z.object({
  portalId: z.enum(portalIds, { error: "Elegí el portal que visitaste." }),
  kind: z.enum(["review", "suggestion", "complaint"], { error: "Elegí qué querés contarnos." }),
  rating: z.number({ error: "Elegí de 1 a 5 estrellas." }).int().min(1, "Elegí de 1 a 5 estrellas.").max(5),
  message: z
    .string()
    .trim()
    .min(10, "Contanos un poco más (al menos 10 caracteres).")
    .max(FEEDBACK_MESSAGE_MAX, `El mensaje puede tener hasta ${FEEDBACK_MESSAGE_MAX} caracteres.`),
  visitDate: z
    .union([
      z.literal(""),
      z.iso.date("Revisá la fecha.").refine((d) => {
        const { min, max } = visitDateBounds();
        return d >= min && d <= max;
      }, "La fecha tiene que ser de este último año y no futura."),
    ])
    .optional(),
  email: z.union([z.literal(""), z.email("Revisá el email.")]).optional(),
});

export const feedbackPhotoSchema = z
  .instanceof(File)
  .refine((f) => FEEDBACK_PHOTO_TYPES.includes(f.type), "La foto tiene que ser JPG, PNG o WebP.")
  .refine((f) => f.size <= FEEDBACK_PHOTO_MAX_MB * 1024 * 1024, `La foto puede pesar hasta ${FEEDBACK_PHOTO_MAX_MB} MB.`);

export type FeedbackFieldErrors = Partial<Record<keyof z.infer<typeof feedbackInputSchema> | "photo", string>>;
