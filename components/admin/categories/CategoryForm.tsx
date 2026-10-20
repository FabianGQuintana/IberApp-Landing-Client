"use client";

import { useRef, useState, type FormEvent } from "react";
import { CATEGORY_DESCRIPTION_MAX, categoryInputSchema, SEVERITY_LEVELS, type CategoryFieldErrors } from "@/components/admin/categories/schema";
import { SeverityBadge } from "@/components/admin/ui/SeverityBadge";
import { BigButton } from "@/components/rangers/ui/BigButton";
import { ErrorBox } from "@/components/rangers/ui/ErrorBox";
import { TextField } from "@/components/rangers/ui/TextField";
import { ApiError, OfflineError } from "@/lib/api/client";
import { createCategory } from "@/services/admin/categories";
import type { ReportCategory, SeverityLevel } from "@/types/admin/report";

const IDS = {
  name: "category-name",
  nameError: "category-name-error",
  description: "category-description",
  descriptionCount: "category-description-count",
  descriptionError: "category-description-error",
  severityError: "category-severity-error",
};

type Props = { onCreated: (category: ReportCategory) => void };

/** "Nueva categoría": name, optional description and one of the 5 severities. There is no edit or delete (the backend has none). */
export function CategoryForm({ onCreated }: Props) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [severity, setSeverity] = useState<SeverityLevel | "">("");
  const [errors, setErrors] = useState<CategoryFieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [created, setCreated] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const nameRef = useRef<HTMLInputElement>(null);
  const descriptionRef = useRef<HTMLTextAreaElement>(null);
  const severityRef = useRef<HTMLInputElement>(null);

  const edit = (key: keyof CategoryFieldErrors) => {
    setErrors((e) => ({ ...e, [key]: undefined }));
    setCreated(null);
  };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setCreated(null);

    const parsed = categoryInputSchema.safeParse({ name, description, severityLevel: severity });
    if (!parsed.success) {
      const next: CategoryFieldErrors = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path[0] as keyof CategoryFieldErrors;
        next[key] ??= issue.message;
      }
      setErrors(next);
      // Take the user to the first field to fix
      (next.name ? nameRef : next.description ? descriptionRef : severityRef).current?.focus();
      return;
    }

    setErrors({});
    setBusy(true);
    try {
      const category = await createCategory({
        name: parsed.data.name,
        description: parsed.data.description || undefined,
        severityLevel: parsed.data.severityLevel,
      });
      setName("");
      setDescription("");
      setSeverity("");
      setCreated(category.name);
      onCreated(category);
    } catch (err) {
      // A repeated name is a problem of the name field: show it right there
      if (err instanceof ApiError && err.status === 409) {
        setErrors({ name: err.message });
        nameRef.current?.focus();
      } else if (err instanceof OfflineError) setFormError("No hay conexión con el servidor. Probá de nuevo en unos minutos.");
      else if (err instanceof ApiError) setFormError(err.message);
      else setFormError("No pudimos crear la categoría. Probá de nuevo.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <aside aria-labelledby="new-category-title" className="flex flex-col gap-5 rounded-[12px] border border-rule bg-page p-[clamp(20px,2.4vw,28px)] lg:sticky lg:top-[92px]">
      <h2 id="new-category-title" className="title-display m-0 text-[28px] leading-[0.95] text-head">
        Nueva categoría
      </h2>
      <p className="m-0 flex gap-2 rounded-[10px] border border-sky bg-sky/10 p-3 text-[15px] text-fg">
        <span aria-hidden="true">📱</span>
        <span>Las categorías nuevas todavía no aparecen en la app de guardaparques.</span>
      </p>

      <form onSubmit={submit} className="flex flex-col gap-5" noValidate>
        <div className="flex flex-col gap-2">
          <TextField
            ref={nameRef}
            id={IDS.name}
            label="Nombre"
            autoComplete="off"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              edit("name");
            }}
            aria-invalid={errors.name ? true : undefined}
            aria-describedby={errors.name ? IDS.nameError : undefined}
            className="aria-invalid:border-[#e5484d]"
          />
          <FieldError id={IDS.nameError} message={errors.name} />
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor={IDS.description} className="eyebrow text-mute">
            Descripción (opcional)
          </label>
          <textarea
            ref={descriptionRef}
            id={IDS.description}
            rows={3}
            value={description}
            onChange={(e) => {
              setDescription(e.target.value);
              edit("description");
            }}
            aria-invalid={errors.description ? true : undefined}
            aria-describedby={errors.description ? `${IDS.descriptionError} ${IDS.descriptionCount}` : IDS.descriptionCount}
            className="min-h-24 w-full resize-y rounded-[10px] border border-rule bg-page-2 px-4 py-3 text-[17px] text-fg outline-none transition-colors focus:border-mint aria-invalid:border-[#e5484d]"
          />
          <span id={IDS.descriptionCount} className="self-end text-[14px] text-mute">
            {description.trim().length} de {CATEGORY_DESCRIPTION_MAX} caracteres
          </span>
          <FieldError id={IDS.descriptionError} message={errors.description} />
        </div>

        <fieldset className="m-0 flex min-w-0 flex-col gap-2 border-0 p-0">
          <legend className="eyebrow mb-2 p-0 text-mute">Gravedad</legend>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
            {SEVERITY_LEVELS.map((level, i) => (
              <label
                key={level}
                className={`flex min-h-12 cursor-pointer items-center gap-3 rounded-[10px] border px-3.5 transition-colors has-[:checked]:border-mint has-[:checked]:bg-mint/10 ${
                  errors.severityLevel ? "border-[#e5484d]" : "border-rule hover:border-fg"
                }`}
              >
                <input
                  ref={i === 0 ? severityRef : undefined}
                  type="radio"
                  name="severityLevel"
                  value={level}
                  checked={severity === level}
                  onChange={() => {
                    setSeverity(level);
                    edit("severityLevel");
                  }}
                  aria-describedby={errors.severityLevel ? IDS.severityError : undefined}
                  className="size-4 shrink-0 accent-mint"
                />
                <SeverityBadge level={level} />
              </label>
            ))}
          </div>
          <FieldError id={IDS.severityError} message={errors.severityLevel} />
        </fieldset>

        <ErrorBox message={formError} />

        {created ? (
          <p role="status" className="m-0 flex gap-2 rounded-[10px] border border-mint bg-mint/10 p-3 text-[15px] font-semibold text-fg">
            <span aria-hidden="true">✅</span>
            <span>Listo: se creó «{created}». Ya aparece en la lista y en el filtro de reportes.</span>
          </p>
        ) : null}

        <BigButton type="submit" icon="➕" disabled={busy} aria-busy={busy}>
          {busy ? "Creando…" : "Crear categoría"}
        </BigButton>
      </form>
    </aside>
  );
}

function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null;
  return (
    <p id={id} className="m-0 flex items-start gap-2 text-[15px] font-medium text-fg">
      <span aria-hidden="true">⚠️</span>
      <span>{message}</span>
    </p>
  );
}
