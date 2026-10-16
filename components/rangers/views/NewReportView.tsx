"use client";

import { useEffect, useRef, useState } from "react";
import { BigButton } from "@/components/rangers/ui/BigButton";
import { ErrorBox } from "@/components/rangers/ui/ErrorBox";
import { Screen } from "@/components/rangers/ui/Screen";
import { SuccessOverlay } from "@/components/rangers/ui/SuccessOverlay";
import { Spinner } from "@/components/rangers/ui/Spinner";
import { useSilentLocation, type LocationStatus } from "@/hooks/rangers/useSilentLocation";
import { CATEGORIES } from "@/lib/rangers/categories";
import { newId } from "@/lib/rangers/id";
import { compressPhoto } from "@/lib/rangers/compress";
import { DEMO_MODE, DEMO_PHOTO_URL, DEMO_POSITION } from "@/lib/rangers/demo";
import { saveReport } from "@/lib/rangers/reports-db";

type Props = { onDone: () => void };

/** How long "Guardar" waits for the GPS if it has no position yet. */
const GPS_WAIT_MS = 15_000;

/**
 * Vista 2 — Nuevo reporte, pensado para usar en el terreno y sin señal:
 * foto con la cámara del teléfono, una categoría con un toque, notas opcionales y guardar.
 * La ubicación se toma sola en segundo plano apenas se abre la pantalla.
 */
export function NewReportView({ onDone }: Props) {
  const { fix, status, waitForFix } = useSilentLocation();
  const fileRef = useRef<HTMLInputElement>(null);
  const categoriesRef = useRef<HTMLFieldSetElement>(null);

  const [photo, setPhotoState] = useState<{ blob: Blob; url: string } | null>(null);
  const photoRef = useRef(photo);
  const [processingPhoto, setProcessingPhoto] = useState(false);
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState<"idle" | "waiting-gps" | "saving">("idle");
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  // Preview of the photo: the temporary URL is released when the photo changes or the screen closes
  const setPhoto = (blob: Blob) => {
    if (photoRef.current) URL.revokeObjectURL(photoRef.current.url);
    const next = { blob, url: URL.createObjectURL(blob) };
    photoRef.current = next;
    setPhotoState(next);
  };

  useEffect(
    () => () => {
      if (photoRef.current) URL.revokeObjectURL(photoRef.current.url);
    },
    [],
  );

  const onPhotoSelected = async (file: File | undefined) => {
    if (!file) return;
    setProcessingPhoto(true);
    setError(null);
    try {
      setPhoto(await compressPhoto(file));
    } catch {
      setPhoto(file); // could not shrink it: keep the original
    } finally {
      setProcessingPhoto(false);
      if (fileRef.current) fileRef.current.value = ""; // allows taking the same photo again
    }
  };

  // Demo mode: a sample photo so the flow can be tried on a computer without a camera
  const loadSamplePhoto = async () => {
    setProcessingPhoto(true);
    setError(null);
    try {
      const blob = await (await fetch(DEMO_PHOTO_URL)).blob();
      setPhoto(blob);
    } catch {
      setError("No se pudo cargar la foto de ejemplo.");
    } finally {
      setProcessingPhoto(false);
    }
  };

  const save = async () => {
    if (!categoryId) {
      setError("Elegí qué encontraste tocando uno de los 4 botones.");
      categoriesRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
    setError(null);

    // If the GPS has not answered yet, give it a few more seconds (it works without mobile signal)
    let position = fix;
    if (!position && status !== "denied" && status !== "unavailable") {
      setSaving("waiting-gps");
      position = await waitForFix(DEMO_MODE ? 4000 : GPS_WAIT_MS);
    }
    // Demo mode: if the browser gives no position (permission denied, desktop without GPS), use Laguna Iberá
    if (!position && DEMO_MODE) position = DEMO_POSITION;

    setSaving("saving");
    try {
      await saveReport({
        clientId: newId(),
        categoryId,
        latitude: position?.latitude ?? null,
        longitude: position?.longitude ?? null,
        accuracy: position ? Math.round(position.accuracy) : null,
        notes: notes.trim(),
        captureDate: new Date().toISOString(),
        photo: photo?.blob ?? null,
      });
      setSaved(true);
    } catch {
      setError("No se pudo guardar en el teléfono. Revisá que tenga espacio libre y probá de nuevo.");
    } finally {
      setSaving("idle");
    }
  };

  if (saved) {
    return (
      <SuccessOverlay
        title="¡Reporte guardado!"
        message={
          fix || status === "ok" || DEMO_MODE
            ? "Quedó en el teléfono. Envialo con «Sincronizar» cuando tengas señal."
            : "Quedó en el teléfono, pero sin ubicación GPS. Envialo con «Sincronizar» cuando tengas señal."
        }
        buttonLabel="Volver al inicio"
        onClose={onDone}
      />
    );
  }

  return (
    <Screen
      title="Nuevo reporte"
      onBack={onDone}
      footer={
        saving !== "idle" ? (
          <Spinner label={saving === "waiting-gps" ? "Buscando la ubicación GPS…" : "Guardando…"} />
        ) : (
          <BigButton icon="💾" onClick={save}>
            Guardar reporte
          </BigButton>
        )
      }
    >
      {/* 1. Foto */}
      <section aria-labelledby="photo-title" className="flex flex-col gap-3">
        <h2 id="photo-title" className="sr-only">
          Foto
        </h2>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={(e) => onPhotoSelected(e.target.files?.[0])}
        />

        {processingPhoto ? (
          <Spinner label="Preparando la foto…" />
        ) : photo ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element -- local blob preview, next/image does not apply */}
            <img src={photo.url} alt="Foto tomada para el reporte" className="max-h-[40svh] w-full rounded-[12px] border border-mint object-cover" />
            <p className="text-center text-[17px] font-semibold text-mint">
              <span aria-hidden="true">✓ </span>Foto lista
            </p>
            <BigButton variant="neutral" icon="🔁" onClick={() => fileRef.current?.click()}>
              Sacar otra foto
            </BigButton>
          </>
        ) : (
          <>
            <BigButton icon="📷" className="min-h-32" onClick={() => fileRef.current?.click()}>
              Tomar foto
            </BigButton>
            {DEMO_MODE ? (
              <BigButton variant="neutral" icon="🖼️" onClick={loadSamplePhoto}>
                Usar foto de ejemplo (demo)
              </BigButton>
            ) : null}
          </>
        )}
      </section>

      {/* 2. Categoría */}
      <fieldset ref={categoriesRef} className="flex flex-col gap-3">
        <legend className="mb-3 title-display text-[24px] ">¿Qué encontraste?</legend>
        <div role="radiogroup" aria-label="¿Qué encontraste?" className="grid grid-cols-2 gap-3">
          {CATEGORIES.map((c) => {
            const selected = c.id === categoryId;
            return (
              <button
                key={c.id}
                type="button"
                role="radio"
                aria-checked={selected}
                aria-label={`${c.label}: ${c.description}`}
                onClick={() => {
                  setCategoryId(c.id);
                  setError(null);
                }}
                className={`relative flex min-h-28 flex-col items-center justify-center gap-2 rounded-[12px] border-2 p-3 text-center text-[17px]  transition-colors ${
                  selected ? "border-mint bg-mint text-night" : "border-rule bg-page-2 text-fg hover:border-mint active:bg-page"
                }`}
              >
                {selected ? (
                  <span aria-hidden="true" className="absolute right-2 top-2 flex size-7 items-center justify-center rounded-full bg-night text-[15px] text-mint">
                    ✓
                  </span>
                ) : null}
                <span aria-hidden="true" className="text-[2.2rem] leading-none">
                  {c.icon}
                </span>
                <span>{c.label}</span>
              </button>
            );
          })}
        </div>
      </fieldset>

      <ErrorBox message={error} />

      {/* 3. Notas (opcional) */}
      <label htmlFor="notes" className="flex flex-col gap-2">
        <span className="text-[17px] font-semibold">Notas (opcional)</span>
        <textarea
          id="notes"
          rows={3}
          maxLength={1000}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="w-full rounded-[12px] border border-rule bg-page-2 p-4 text-[17px]"
        />
      </label>

      <LocationLine status={status} accuracy={fix?.accuracy ?? null} />
    </Screen>
  );
}

/** Discreet line about the GPS: the ranger does not have to do anything, but can see that it worked. */
function LocationLine({ status, accuracy }: { status: LocationStatus; accuracy: number | null }) {
  const text =
    status === "ok"
      ? `📍 Ubicación tomada${accuracy ? ` (±${Math.round(accuracy)} m)` : ""}`
      : status === "searching"
        ? "📍 Buscando ubicación…"
        : status === "denied"
          ? "📍 El teléfono no dio permiso para la ubicación. Activalo en los ajustes del navegador."
          : "📍 No se pudo tomar la ubicación. El reporte se guarda igual.";

  return (
    <p role="status" aria-live="polite" className={`text-[15px] font-semibold ${status === "ok" ? "text-mint" : status === "searching" ? "text-mute" : "text-orange"}`}>
      {text}
    </p>
  );
}
