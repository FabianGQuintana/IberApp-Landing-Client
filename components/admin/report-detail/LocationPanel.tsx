"use client";

import { useEffect, useState } from "react";
import { nearestPortal } from "@/utils/geo";
import { formatCoords, formatDistance, googleMapsUrl } from "./format";
import { BUTTON, Field, Panel } from "./Panel";
import { ReportMiniMap } from "./ReportMiniMap";

type CopyState = "idle" | "copied" | "failed";

/** Where the report was taken: mini map, coordinates to copy or open in Google Maps, and the nearest portal. */
export function LocationPanel({ latitude, longitude }: { latitude: number; longitude: number }) {
  const [copy, setCopy] = useState<CopyState>("idle");
  const coords = formatCoords(latitude, longitude);
  // The report has no portal (the backend does not store one): it is worked out here
  const nearest = nearestPortal({ lat: latitude, lng: longitude });

  useEffect(() => {
    if (copy === "idle") return;
    const timer = window.setTimeout(() => setCopy("idle"), 2500);
    return () => window.clearTimeout(timer);
  }, [copy]);

  const copyCoords = async () => {
    try {
      await navigator.clipboard.writeText(coords);
      setCopy("copied");
    } catch {
      setCopy("failed");
    }
  };

  return (
    <Panel title="Ubicación">
      <ReportMiniMap lat={latitude} lng={longitude} />

      <dl className="m-0 flex flex-col gap-4">
        <Field label="Coordenadas">
          <span className="font-mono text-[15px] tabular-nums">{coords}</span>
        </Field>
        {nearest ? (
          <Field label="Portal más cercano">
            <strong>{nearest.portal.name}</strong> <span className="text-mute">({nearest.portal.locality})</span>, a {formatDistance(nearest.km)}
          </Field>
        ) : null}
      </dl>

      <div className="flex flex-wrap items-center gap-2">
        <button type="button" onClick={copyCoords} className={`${BUTTON.base} ${BUTTON.neutral}`}>
          {copy === "copied" ? "✓ Copiadas" : copy === "failed" ? "No se pudo copiar" : "Copiar coordenadas"}
        </button>
        <a href={googleMapsUrl(latitude, longitude)} target="_blank" rel="noopener noreferrer" className={`${BUTTON.base} ${BUTTON.neutral}`}>
          Abrir en Google Maps ↗
        </a>
      </div>
      <span role="status" className="sr-only">
        {copy === "copied" ? "Coordenadas copiadas." : copy === "failed" ? "No pudimos copiarlas: seleccioná el texto y copialo a mano." : ""}
      </span>
    </Panel>
  );
}
