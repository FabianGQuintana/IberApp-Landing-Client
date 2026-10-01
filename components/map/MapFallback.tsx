import Image from "next/image";
import type { ReactNode } from "react";
import { toPercent } from "@/lib/map/config";
import type { MapPoint } from "./MapView";

interface MapFallbackProps<P extends MapPoint> {
  points?: P[];
  activeId?: string | null;
  renderMarker?: (point: P, active: boolean) => ReactNode;
}

// Fallback without WebGL / while loading: static satellite image with approximate pins.
export function MapFallback<P extends MapPoint>({ points = [], activeId = null, renderMarker }: MapFallbackProps<P>) {
  return (
    <div className="absolute inset-0 bg-night-2">
      <Image src="/img/satellite.webp" alt="" fill sizes="(min-width: 1024px) 50vw, 100vw" className="object-cover" />
      {renderMarker &&
        points.map((p) => {
          const { x, y } = toPercent(p.lat, p.lng);
          return (
            <div key={p.id} className="absolute -translate-x-1/2 -translate-y-1/2" style={{ left: `${x}%`, top: `${y}%` }}>
              {renderMarker(p, p.id === activeId)}
            </div>
          );
        })}
      <span className="absolute bottom-3 left-3 rounded-full bg-white/90 px-3 py-1.5 text-[11px] text-mute">Imagen satelital · INPE (CC BY-SA)</span>
    </div>
  );
}
