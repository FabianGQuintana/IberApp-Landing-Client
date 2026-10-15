import { z } from "zod";
import { PORTALS } from "@/lib/data/portals";

export const FEEDBACK_MESSAGE_MAX = 1000;
export const FEEDBACK_PHOTO_MAX_MB = 5;
export const FEEDBACK_PHOTO_TYPES = ["image/jpeg", "image/png", "image/webp"];

const portalIds = PORTALS.map((p) => p.id) as [string, ...string[]];

// Shared by the modal and, later, the backend contract.
export const feedbackInputSchema = z.object({
  portalId: z.enum(portalIds, { error: "Elegí el portal que visitaste." }),
  rating: z.number({ error: "Elegí de 1 a 5 estrellas." }).int().min(1, "Elegí de 1 a 5 estrellas.").max(5),
  message: z
    .string()
    .trim()
    .min(10, "Contanos un poco más (al menos 10 caracteres).")
    .max(FEEDBACK_MESSAGE_MAX, `El mensaje puede tener hasta ${FEEDBACK_MESSAGE_MAX} caracteres.`),
  email: z.union([z.literal(""), z.email("Revisá el email.")]).optional(),
  photo: z
    .instanceof(File)
    .refine((f) => FEEDBACK_PHOTO_TYPES.includes(f.type), "La foto tiene que ser JPG, PNG o WebP.")
    .refine((f) => f.size <= FEEDBACK_PHOTO_MAX_MB * 1024 * 1024, `La foto puede pesar hasta ${FEEDBACK_PHOTO_MAX_MB} MB.`)
    .optional(),
});

export type FeedbackFieldErrors = Partial<Record<keyof z.infer<typeof feedbackInputSchema>, string>>;
