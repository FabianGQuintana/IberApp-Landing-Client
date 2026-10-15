"use client";

import { useCallback, useEffect, useId, useRef, useState, type FormEvent, type ReactNode } from "react";
import { LineIcon } from "@/components/ui/Controls";
import { Icon } from "@/components/ui/Icon";
import { useLanding } from "@/context/LandingContext";
import { PORTALS } from "@/lib/data/portals";
import {
  FEEDBACK_MESSAGE_MAX,
  FEEDBACK_PHOTO_MAX_MB,
  FEEDBACK_PHOTO_TYPES,
  feedbackInputSchema,
  type FeedbackFieldErrors,
} from "@/lib/validation/feedback";
import { submitFeedback } from "@/services/feedback";
import type { Rating } from "@/types/feedback";

const EASE = "cubic-bezier(.2,.7,.2,1)";
const RATING_LABELS = ["Muy mala", "Mala", "Regular", "Buena", "Excelente"];

type Phase = "form" | "sending" | "done";

const fieldClass =
  "w-full rounded-[10px] border border-rule bg-transparent px-4 text-base text-fg outline-none transition-[border-color] duration-300 placeholder:text-mute focus:border-mint aria-[invalid=true]:border-orange";

/** "Valorar" modal: tourists rate the portal they visited. Opened from the header (LandingContext.feedbackOpen). */
export function FeedbackModal() {
  const { feedbackOpen, closeFeedback } = useLanding();
  // Mounted only while open, so every visit starts with an empty form.
  return feedbackOpen ? <FeedbackDialog onClose={closeFeedback} /> : null;
}

function FeedbackDialog({ onClose: unmount }: { onClose: () => void }) {
  const [shown, setShown] = useState(false);
  const titleId = useId();
  const firstField = useRef<HTMLSelectElement>(null);
  const fileInput = useRef<HTMLInputElement>(null);

  const [portalId, setPortalId] = useState("");
  const [rating, setRating] = useState<Rating | 0>(0);
  const [hover, setHover] = useState(0);
  const [message, setMessage] = useState("");
  const [email, setEmail] = useState("");
  const [photo, setPhoto] = useState<File | undefined>();
  const [preview, setPreview] = useState<string | undefined>();
  const [errors, setErrors] = useState<FeedbackFieldErrors>({});
  const [phase, setPhase] = useState<Phase>("form");
  const [submitError, setSubmitError] = useState<string>();
  const [code, setCode] = useState("");

  // Same closing pattern as Lightbox: animate out, then unmount.
  const onClose = useCallback(() => {
    setShown(false);
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.setTimeout(unmount, reduce ? 0 : 420);
  }, [unmount]);

  useEffect(() => {
    const frame = requestAnimationFrame(() => setShown(true));
    return () => cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    firstField.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  useEffect(() => () => void (preview && URL.revokeObjectURL(preview)), [preview]);

  const pickPhoto = (file?: File) => {
    setPhoto(file);
    setPreview(file ? URL.createObjectURL(file) : undefined);
    setErrors((e) => ({ ...e, photo: undefined }));
    if (!file && fileInput.current) fileInput.current.value = "";
  };

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const parsed = feedbackInputSchema.safeParse({ portalId, rating, message, email, photo });
    if (!parsed.success) {
      const next: FeedbackFieldErrors = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path[0] as keyof FeedbackFieldErrors;
        next[key] ??= issue.message;
      }
      setErrors(next);
      return;
    }
    setErrors({});
    setSubmitError(undefined);
    setPhase("sending");
    try {
      const result = await submitFeedback({
        portalId: parsed.data.portalId,
        rating: parsed.data.rating as Rating,
        message: parsed.data.message,
        email: parsed.data.email || undefined,
        photo: parsed.data.photo,
      });
      setCode(result.code);
      setPhase("done");
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "No pudimos enviar tu valoración.");
      setPhase("form");
    }
  };

  const shownRating = hover || rating;
  const portalName = PORTALS.find((p) => p.id === portalId)?.name;

  return (
    <div
      className="fixed inset-0 z-[90] flex items-end justify-center tab:items-center tab:p-6"
      style={{ background: `rgba(11,16,14,${shown ? 0.72 : 0})`, transition: `background-color .45s ${EASE}` }}
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="flex max-h-[92dvh] w-full flex-col overflow-hidden rounded-t-[12px] border border-rule bg-page-2 text-fg tab:max-h-[88dvh] tab:max-w-[560px] tab:rounded-[12px]"
        style={{
          opacity: shown ? 1 : 0,
          transform: `translateY(${shown ? 0 : 24}px)`,
          transition: `opacity .45s ${EASE}, transform .6s ${EASE}`,
        }}
      >
        <div className="flex items-start justify-between gap-4 border-b border-rule-2 px-6 pb-5 pt-6">
          <div className="flex flex-col gap-2.5">
            <span className="eyebrow text-mute">Tu experiencia</span>
            <h2 id={titleId} className="title-display text-[32px] leading-[0.95] text-head">
              {phase === "done" ? "¡Gracias por contarnos!" : "Valorá tu visita"}
            </h2>
          </div>
          <button
            type="button"
            aria-label="Cerrar"
            onClick={onClose}
            className="flex h-10 w-10 flex-none items-center justify-center rounded-full border border-rule bg-transparent p-0 text-head transition-[border-color] duration-300 hover:border-head"
          >
            <LineIcon name="close" />
          </button>
        </div>

        {phase === "done" ? (
          <div className="flex flex-col gap-5 overflow-y-auto px-6 py-7">
            <Icon name="check" color="var(--color-leaf)" knockout="var(--bg2)" size={44} />
            <p className="text-[17px] leading-[1.5]">
              Recibimos tu valoración de <strong className="text-head">{portalName}</strong>. La leen los guardaparques y el
              equipo del portal para mejorar la visita.
            </p>
            {code && (
              <p className="text-sm text-mute">
                Número de referencia: <span className="font-medium text-fg">{code}</span>
              </p>
            )}
            <button
              type="button"
              onClick={onClose}
              className="mt-2 h-12 self-start rounded-[10px] border-none bg-btn px-6 text-base font-medium text-btn-fg transition-transform duration-[350ms] hover:scale-[1.015]"
            >
              Volver a la página
            </button>
          </div>
        ) : (
          <form noValidate onSubmit={onSubmit} className="flex flex-col gap-6 overflow-y-auto px-6 py-6">
            <Field label="Portal visitado" htmlFor="fb-portal" error={errors.portalId}>
              <select
                ref={firstField}
                id="fb-portal"
                value={portalId}
                onChange={(e) => setPortalId(e.target.value)}
                aria-invalid={!!errors.portalId}
                className={`${fieldClass} h-12 cursor-pointer appearance-none bg-[url("data:image/svg+xml,%3Csvg%20xmlns='http://www.w3.org/2000/svg'%20width='20'%20height='20'%20viewBox='0%200%2024%2024'%20fill='none'%20stroke='%238FA89A'%20stroke-width='1.7'%3E%3Cpath%20d='M6%209l6%206%206-6'/%3E%3C/svg%3E")] bg-[length:20px] bg-[right_14px_center] bg-no-repeat pr-11`}
              >
                <option value="" disabled>
                  Elegí un portal
                </option>
                {PORTALS.map((p) => (
                  <option key={p.id} value={p.id} className="bg-page-2 text-fg">
                    {p.name} · {p.locality}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="¿Cómo fue tu experiencia?" error={errors.rating} as="fieldset">
              <div className="flex items-center gap-4" onMouseLeave={() => setHover(0)}>
                <div role="radiogroup" aria-label="Valoración de 1 a 5 estrellas" className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((n) => {
                    const on = n <= shownRating;
                    return (
                      <button
                        key={n}
                        type="button"
                        role="radio"
                        aria-checked={rating === n}
                        aria-label={`${n} ${n === 1 ? "estrella" : "estrellas"}: ${RATING_LABELS[n - 1]}`}
                        onClick={() => {
                          setRating(n as Rating);
                          setErrors((e) => ({ ...e, rating: undefined }));
                        }}
                        onMouseEnter={() => setHover(n)}
                        className="flex h-11 w-11 items-center justify-center rounded-full border-none bg-transparent p-0 transition-transform duration-[450ms] ease-[cubic-bezier(.3,1.2,.4,1)] hover:scale-110 focus-visible:outline-2 focus-visible:outline-mint"
                      >
                        <Icon name="star" size={34} color={on ? "var(--color-yellow)" : "var(--rule)"} />
                      </button>
                    );
                  })}
                </div>
                <span className="text-[15px] font-medium text-mute" aria-live="polite">
                  {shownRating ? RATING_LABELS[shownRating - 1] : ""}
                </span>
              </div>
            </Field>

            <Field label="Tu reseña, sugerencia o queja" htmlFor="fb-message" error={errors.message}>
              <textarea
                id="fb-message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                maxLength={FEEDBACK_MESSAGE_MAX}
                rows={5}
                aria-invalid={!!errors.message}
                placeholder="Qué te gustó, qué mejorarías o qué problema encontraste."
                className={`${fieldClass} resize-y py-3 leading-[1.45]`}
              />
              <span className="self-end text-xs text-mute">
                {message.length} / {FEEDBACK_MESSAGE_MAX}
              </span>
            </Field>

            <Field label="Email" hint="Opcional, solo si querés que te respondamos" htmlFor="fb-email" error={errors.email}>
              <input
                id="fb-email"
                type="email"
                inputMode="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                aria-invalid={!!errors.email}
                placeholder="nombre@correo.com"
                className={`${fieldClass} h-12`}
              />
            </Field>

            <Field label="Foto de la visita" hint={`Opcional · JPG, PNG o WebP hasta ${FEEDBACK_PHOTO_MAX_MB} MB`} htmlFor="fb-photo" error={errors.photo}>
              <input
                ref={fileInput}
                id="fb-photo"
                type="file"
                accept={FEEDBACK_PHOTO_TYPES.join(",")}
                className="sr-only"
                onChange={(e) => pickPhoto(e.target.files?.[0])}
              />
              {preview ? (
                <div className="flex items-center gap-4 rounded-[10px] border border-rule p-3">
                  {/* eslint-disable-next-line @next/next/no-img-element -- local blob preview */}
                  <img src={preview} alt="Vista previa de la foto" className="h-16 w-16 flex-none rounded-[4px] object-cover" />
                  <span className="min-w-0 flex-1 truncate text-sm">{photo?.name}</span>
                  <button type="button" onClick={() => pickPhoto(undefined)} className="border-none bg-transparent p-0 text-sm font-medium text-head underline underline-offset-4">
                    Quitar
                  </button>
                </div>
              ) : (
                <label
                  htmlFor="fb-photo"
                  className="flex h-[76px] cursor-pointer items-center justify-center gap-3 rounded-[10px] border border-dashed border-rule text-[15px] font-medium text-mute transition-[border-color,color] duration-300 hover:border-mint hover:text-fg"
                >
                  <Icon name="camera" size={22} color="currentColor" knockout="var(--bg2)" />
                  Subir una foto
                </label>
              )}
            </Field>

            {submitError && (
              <p role="alert" className="flex items-center gap-2.5 rounded-[10px] border border-orange/50 px-4 py-3 text-sm">
                <Icon name="alert" size={18} color="var(--color-orange)" knockout="var(--bg2)" />
                {submitError}
              </p>
            )}

            <button
              type="submit"
              disabled={phase === "sending"}
              className="h-12 rounded-[10px] border-none bg-btn px-6 text-base font-medium text-btn-fg transition-[transform,opacity] duration-[350ms] hover:scale-[1.01] disabled:cursor-wait disabled:opacity-60"
            >
              {phase === "sending" ? "Enviando…" : "Enviar valoración"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

function Field({
  label,
  hint,
  htmlFor,
  error,
  as = "div",
  children,
}: {
  label: string;
  hint?: string;
  htmlFor?: string;
  error?: string;
  as?: "div" | "fieldset";
  children: ReactNode;
}) {
  const Wrapper = as;
  const Label = as === "fieldset" ? "legend" : "label";
  return (
    <Wrapper className="m-0 flex min-w-0 flex-col gap-2.5 border-none p-0">
      <Label {...(Label === "label" ? { htmlFor } : {})} className="flex flex-wrap items-baseline gap-x-2 p-0 text-[15px] font-medium text-head">
        {label}
        {hint && <span className="text-[13px] font-normal text-mute">{hint}</span>}
      </Label>
      {children}
      {error && (
        <span role="alert" className="text-sm text-orange">
          {error}
        </span>
      )}
    </Wrapper>
  );
}
