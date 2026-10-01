"use client";

import { useState } from "react";
import { PORTALS } from "@/lib/data/portals";
import { attributionShort, smallPadding } from "@/lib/map/config";
import { MapView, type MapStatus } from "./MapView";

const SPRING = "cubic-bezier(.3,1.2,.4,1)";

// Small non-interactive map in the portal sheet (v6 `aside` map): the 8 portals, the current one highlighted.
export function PortalMiniMap({ portalId, label }: { portalId: string; label: string }) {
  const [status, setStatus] = useState<MapStatus>("loading");
  const ready = status === "ready";

  return (
    <div className="relative mt-6 aspect-[16/10] overflow-hidden rounded-[2px] bg-[#0D1511]">
      <div className="absolute inset-0 transition-opacity duration-[800ms]" style={{ opacity: ready ? 1 : 0 }} aria-hidden="true">
        <MapView
          label={`Ubicación de ${label}`}
          points={PORTALS}
          interactive={false}
          padding={smallPadding}
          onStatusChange={setStatus}
          pointZ={(p) => (p.id === portalId ? 2 : 1)}
          renderPoint={(p) => {
            const on = p.id === portalId;
            const d = on ? 9 : 5;
            return (
              <span
                className="absolute rounded-full bg-cloud"
                style={{
                  left: -d / 2,
                  top: -d / 2,
                  width: d,
                  height: d,
                  opacity: on ? 1 : 0.5,
                  boxShadow: `0 0 0 ${on ? 6 : 0}px rgba(0,213,138,.35)`,
                  transition: `all .6s ${SPRING}`,
                }}
              />
            );
          }}
        />
      </div>
      {!ready && (
        <span className="eyebrow pointer-events-none absolute left-1/2 top-[28%] -translate-x-1/2 -translate-y-1/2 text-[11px] text-sage">
          {status === "error" ? "Mapa no disponible" : "Cargando mapa…"}
        </span>
      )}
      <span className="eyebrow absolute bottom-3 left-3 text-[11px] text-cloud [text-shadow:0_1px_8px_rgba(0,0,0,.8)]">{label}</span>
      <span className="absolute bottom-1.5 right-2 text-[10px] leading-none text-sage">{attributionShort()}</span>
    </div>
  );
}
