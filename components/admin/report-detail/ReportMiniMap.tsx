"use client";

import { useRef, useState } from "react";
import { MapView, type MapApi, type MapStatus } from "@/components/map/MapView";
import { attributionShort, smallPadding } from "@/lib/map/config";

const ZOOM_IN = 2.5; // over the zoom that fits the whole park: the surroundings of the point stay readable

/** Small non-interactive map with the report's point only (like PortalMiniMap, which is tied to the portals). */
export function ReportMiniMap({ lat, lng }: { lat: number; lng: number }) {
  const [status, setStatus] = useState<MapStatus>("loading");
  const api = useRef<MapApi>(null);
  const ready = status === "ready";

  const onStatusChange = (next: MapStatus) => {
    setStatus(next);
    // The map always opens on the whole park: then it flies to the report
    if (next === "ready") api.current?.flyTo({ lat, lng }, { zoomOffset: ZOOM_IN });
  };

  return (
    <div className="relative aspect-[16/10] overflow-hidden rounded-[10px] bg-[#0D1511]">
      <div className="absolute inset-0 transition-opacity duration-[800ms]" style={{ opacity: ready ? 1 : 0 }} aria-hidden="true">
        <MapView
          api={api}
          label="Ubicación del reporte"
          points={[{ id: "report", lat, lng }]}
          interactive={false}
          padding={smallPadding}
          onStatusChange={onStatusChange}
          renderPoint={() => (
            <span className="absolute -left-[6px] -top-[6px] size-3 rounded-full border-2 border-white bg-mint shadow-[0_0_0_6px_rgba(0,213,138,.35)]" />
          )}
        />
      </div>
      {!ready && (
        <span className="eyebrow pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-[11px] text-sage">
          {status === "error" ? "Mapa no disponible" : "Cargando mapa…"}
        </span>
      )}
      <span className="absolute bottom-1.5 right-2 text-[10px] leading-none text-sage">{attributionShort()}</span>
    </div>
  );
}
