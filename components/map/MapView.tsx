"use client";

import { Map as MLMap, Marker, NavigationControl } from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { ATTRIBUTION, BOUNDS, satStyle } from "@/lib/map/config";
import { MapFallback } from "./MapFallback";

export interface MapPoint {
  id: string;
  lat: number;
  lng: number;
}

export interface MapViewProps<P extends MapPoint> {
  points?: P[];
  activeId?: string | null;
  /** Renders a marker (mounted through a React portal inside the MapLibre marker). */
  renderMarker?: (point: P, active: boolean) => ReactNode;
  /** Fly to the active point when it changes. */
  followActive?: boolean;
  center?: { lat: number; lng: number };
  zoom?: number;
  /** Called with the map center after the user moves the map. */
  onCenterChange?: (c: { lat: number; lng: number }) => void;
  /** On touch screens, require two fingers to pan so the map does not trap page scroll. */
  cooperative?: boolean;
  interactive?: boolean;
  label: string;
  className?: string;
  children?: ReactNode;
}

type Status = "loading" | "ready" | "error";

export default function MapView<P extends MapPoint>({
  points = [],
  activeId = null,
  renderMarker,
  followActive = false,
  center,
  zoom,
  onCenterChange,
  cooperative = false,
  interactive = true,
  label,
  className = "",
  children,
}: MapViewProps<P>) {
  const box = useRef<HTMLDivElement>(null);
  const map = useRef<MLMap | null>(null);
  const markers = useRef(new globalThis.Map<string, Marker>());
  const [els, setEls] = useState<Record<string, HTMLElement>>({});
  const [status, setStatus] = useState<Status>("loading");
  const [attempt, setAttempt] = useState(0);
  const onCenterRef = useRef(onCenterChange);
  useEffect(() => {
    onCenterRef.current = onCenterChange;
  }, [onCenterChange]);

  // Create the map once (or on retry).
  useEffect(() => {
    if (!box.current) return;
    let m: MLMap;
    try {
      m = new MLMap({
        container: box.current,
        style: satStyle(),
        attributionControl: false,
        interactive,
        dragRotate: false,
        pitchWithRotate: false,
        touchPitch: false,
        cooperativeGestures: cooperative,
        maxPitch: 15,
        ...(center ? { center: [center.lng, center.lat], zoom: zoom ?? 13 } : { bounds: BOUNDS, fitBoundsOptions: { padding: 40 } }),
      });
    } catch {
      // WebGL unavailable: report it asynchronously (no synchronous setState inside the effect).
      const id = window.setTimeout(() => setStatus("error"));
      return () => window.clearTimeout(id);
    }
    map.current = m;
    m.touchZoomRotate.disableRotation();
    if (interactive) m.addControl(new NavigationControl({ showCompass: false }), "top-right");

    const timeout = window.setTimeout(() => setStatus((s) => (s === "loading" ? "error" : s)), 20000);
    let tileErrors = 0;
    m.once("idle", () => {
      window.clearTimeout(timeout);
      setStatus("ready");
    });
    m.on("error", (e) => {
      if ((e as { sourceId?: string }).sourceId && ++tileErrors >= 8) setStatus("error");
    });
    m.on("webglcontextlost", () => setStatus("error"));
    let userMoved = false;
    m.on("moveend", (e) => {
      if (!(e as { originalEvent?: unknown }).originalEvent) return;
      userMoved = true;
      const c = m.getCenter();
      onCenterRef.current?.({ lat: +c.lat.toFixed(5), lng: +c.lng.toFixed(5) });
    });
    // When the container resizes (rotation, List/Map tab), refit bounds unless the user already moved the map.
    const ro = new ResizeObserver(() => {
      m.resize();
      if (!center && !userMoved) m.fitBounds(BOUNDS, { padding: 40, duration: 0 });
    });
    ro.observe(box.current);
    const current = markers.current;

    return () => {
      window.clearTimeout(timeout);
      ro.disconnect();
      current.forEach((mk) => mk.remove());
      current.clear();
      setEls({});
      m.remove();
      map.current = null;
    };
    // Only on mount or retry: everything else is synced in other effects.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [attempt]);

  // Sync markers with points.
  useEffect(() => {
    const m = map.current;
    if (!m || !renderMarker) return;
    const next: Record<string, HTMLElement> = {};
    const ids = new Set(points.map((p) => p.id));
    markers.current.forEach((mk, id) => {
      if (!ids.has(id)) {
        mk.remove();
        markers.current.delete(id);
      }
    });
    for (const p of points) {
      const existing = markers.current.get(p.id);
      // setLngLat must run before addTo: MapLibre reads the position while adding the marker.
      const mk = existing ?? new Marker({ element: document.createElement("div") }).setLngLat([p.lng, p.lat]).addTo(m);
      if (existing) mk.setLngLat([p.lng, p.lat]);
      if (!existing) markers.current.set(p.id, mk);
      next[p.id] = mk.getElement();
    }
    setEls(next);
    // renderMarker changes on every parent render; markers only depend on points.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [points, attempt]);

  // Fly to the active point.
  useEffect(() => {
    const m = map.current;
    if (!m || !followActive) return;
    const p = points.find((pt) => pt.id === activeId);
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (p) m.flyTo({ center: [p.lng, p.lat], zoom: Math.max(m.getZoom(), 10), duration: reduce ? 0 : 1200, essential: true });
  }, [activeId, followActive, points]);

  // Re-center when the center changes from outside (e.g. GPS).
  useEffect(() => {
    const m = map.current;
    if (!m || !center) return;
    const c = m.getCenter();
    if (Math.abs(c.lat - center.lat) > 1e-5 || Math.abs(c.lng - center.lng) > 1e-5) m.jumpTo({ center: [center.lng, center.lat] });
  }, [center]);

  const byId = new globalThis.Map(points.map((p) => [p.id, p]));

  return (
    <div className={`relative overflow-hidden ${className}`} role="region" aria-label={label}>
      <div ref={box} className="absolute inset-0" />
      {status !== "ready" && (
        <div className="absolute inset-0">
          <MapFallback points={points} renderMarker={renderMarker} activeId={activeId} />
          <div className="absolute inset-x-4 top-4 flex justify-center">
            {status === "loading" ? (
              <span className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-night">Cargando mapa…</span>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setStatus("loading");
                  setAttempt((a) => a + 1);
                }}
                className="rounded-full bg-white px-4 py-2 text-sm font-bold text-night"
              >
                No pudimos cargar el mapa · Reintentar
              </button>
            )}
          </div>
        </div>
      )}
      {renderMarker &&
        Object.entries(els).map(([id, el]) => {
          const p = byId.get(id);
          return p ? createPortal(renderMarker(p, id === activeId), el, id) : null;
        })}
      {children}
      <span className="pointer-events-none absolute bottom-3 right-3 max-w-[70%] truncate rounded-full bg-white/90 px-3 py-1.5 text-[11px] text-mute">
        {ATTRIBUTION}
      </span>
    </div>
  );
}
