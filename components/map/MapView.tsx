"use client";

import type { Map as MLMap, PaddingOptions } from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { useEffect, useImperativeHandle, useRef, type ReactNode, type Ref } from "react";
import { useTheme } from "@/hooks/useTheme";
import { BOUNDS, satStyle } from "@/lib/map/config";

export type MapStatus = "loading" | "ready" | "error";

export interface GeoPoint {
  id: string;
  lat: number;
  lng: number;
}

/** Imperative controls exposed to the section that owns the map. */
export interface MapApi {
  zoomBy: (delta: number) => void;
  fitAll: (options?: { animate?: boolean }) => void;
  flyTo: (point: { lat: number; lng: number }, options?: { zoomOffset?: number }) => void;
  /** Meters per pixel at the current center and zoom (for the scale bar) */
  metersPerPixel: () => number | null;
}

interface MapViewProps<P extends GeoPoint> {
  label: string;
  points: P[];
  /** Renders the HTML overlay of each point. It is positioned with map.project([lng, lat]) on every move (v6 placeGeo). */
  renderPoint: (point: P, index: number) => ReactNode;
  /** Stacking order of each point overlay (active pin on top) */
  pointZ?: (point: P, index: number) => number;
  padding: (container: HTMLElement) => PaddingOptions;
  pitch?: number;
  interactive?: boolean;
  /** Allow one-finger panning (v6 disables it on the territory map below 1024 px so the page keeps scrolling) */
  dragPan?: boolean;
  scrollZoom?: boolean;
  onStatusChange?: (status: MapStatus) => void;
  onMove?: () => void;
  /** Bumping this number destroys and recreates the map (v6 retryMain) */
  attempt?: number;
  api?: Ref<MapApi>;
  className?: string;
  layerClassName?: string;
}

const LOAD_TIMEOUT_MS = 20_000; // v6: no first idle in 20 s = error
const READY_FALLBACK_MS = 7_000; // v6: treat as ready 7 s after load even if tiles keep loading
const MAX_TILE_ERRORS = 8;
const WORKER_URL = "/vendor/maplibre/maplibre-gl-worker.mjs";

/**
 * MapLibre map from Ibera Landing v6 (mountMap / initMap / placeGeo / treatRaster).
 * - MapLibre is imported in the browser only, when the map gets close to the viewport.
 * - Points are plain HTML overlays (same design as v6), not MapLibre markers.
 * - Failures surface as status "error": the parent shows an honest retry panel, never fake geography.
 */
export function MapView<P extends GeoPoint>({
  label,
  points,
  renderPoint,
  pointZ,
  padding,
  pitch = 0,
  interactive = true,
  dragPan = true,
  scrollZoom = false,
  onStatusChange,
  onMove,
  attempt = 0,
  api,
  className = "",
  layerClassName = "",
}: MapViewProps<P>) {
  const container = useRef<HTMLDivElement>(null);
  const layer = useRef<HTMLDivElement>(null);
  const map = useRef<MLMap | null>(null);
  /** true after flyTo: resizes keep the camera; false after fitAll: resizes refit the whole park (v6 `_fk`) */
  const focused = useRef(false);
  const { isDark } = useTheme();

  // Latest props for the long-lived map listeners.
  const latest = useRef({ padding, pitch, onStatusChange, onMove, isDark, dragPan });
  useEffect(() => {
    latest.current = { padding, pitch, onStatusChange, onMove, isDark, dragPan };
  });

  const placePoints = () => {
    const m = map.current;
    const el = layer.current;
    if (!m || !el) return;
    el.querySelectorAll<HTMLElement>("[data-lng]").forEach((node) => {
      const pt = m.project([Number(node.dataset.lng), Number(node.dataset.lat)]);
      node.style.transform = `translate3d(${pt.x.toFixed(1)}px,${pt.y.toFixed(1)}px,0)`;
    });
  };

  // Raster treatment per theme (v6 treatRaster).
  const treatRaster = (m: MLMap, dark: boolean) => {
    try {
      for (const l of m.getStyle().layers ?? []) {
        if (l.type !== "raster" || l.id === "roads" || l.id === "places") continue;
        m.setPaintProperty(l.id, "raster-saturation", -0.15);
        m.setPaintProperty(l.id, "raster-contrast", 0.08);
        m.setPaintProperty(l.id, "raster-brightness-max", dark ? 0.9 : 0.97);
      }
    } catch {}
  };

  useImperativeHandle(
    api,
    (): MapApi => ({
      zoomBy: (delta) => {
        const m = map.current;
        if (!m) return;
        const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        m.easeTo({ zoom: m.getZoom() + delta, duration: reduce ? 0 : 450 });
      },
      fitAll: ({ animate = true } = {}) => {
        const m = map.current;
        const el = container.current;
        if (!m || !el) return;
        const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        focused.current = false;
        m.fitBounds(BOUNDS, { padding: latest.current.padding(el), pitch: latest.current.pitch, bearing: 0, duration: animate && !reduce ? 1200 : 0 });
      },
      flyTo: (point, { zoomOffset = 1.3 } = {}) => {
        const m = map.current;
        const el = container.current;
        if (!m || !el) return;
        const pad = latest.current.padding(el);
        const base = m.cameraForBounds(BOUNDS, { padding: pad });
        const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        focused.current = true;
        m.flyTo({
          center: [point.lng, point.lat],
          zoom: (base?.zoom ?? 8) + zoomOffset,
          pitch: latest.current.pitch,
          bearing: 0,
          offset: [((pad.left ?? 0) - (pad.right ?? 0)) / 2, ((pad.top ?? 0) - (pad.bottom ?? 0)) / 2],
          duration: reduce ? 0 : 1200,
          curve: 1.2,
          easing: (k) => 1 - Math.pow(1 - k, 3),
          essential: true,
        });
      },
      metersPerPixel: () => {
        const m = map.current;
        if (!m) return null;
        const c = m.getCenter();
        return (40075016.686 * Math.cos((c.lat * Math.PI) / 180)) / (512 * Math.pow(2, m.getZoom()));
      },
    }),
    [],
  );

  // Create the map when it nears the viewport; recreate on retry.
  useEffect(() => {
    const el = container.current;
    if (!el) return;
    let disposed = false;
    let m: MLMap | null = null;
    const timers: number[] = [];
    let resizeObserver: ResizeObserver | undefined;
    const setStatus = (s: MapStatus) => {
      if (!disposed) latest.current.onStatusChange?.(s);
    };

    const create = async () => {
      let lib: typeof import("maplibre-gl");
      try {
        lib = await import("maplibre-gl");
      } catch {
        return setStatus("error");
      }
      if (disposed) return;
      // Worker served from public/ (copied by scripts/copy-maplibre-worker.mjs before dev/build).
      if (!lib.getWorkerUrl().startsWith(WORKER_URL)) lib.setWorkerUrl(WORKER_URL);
      try {
        m = new lib.Map({
          container: el,
          style: satStyle(),
          attributionControl: false,
          interactive,
          dragRotate: false,
          pitchWithRotate: false,
          touchPitch: false,
          dragPan: latest.current.dragPan,
          scrollZoom,
          touchZoomRotate: interactive && latest.current.dragPan,
          doubleClickZoom: interactive,
          keyboard: interactive && scrollZoom,
          maxPitch: 15,
          center: [-57.35, -28.25],
          zoom: 8,
          fadeDuration: 150,
        });
      } catch {
        return setStatus("error"); // no WebGL
      }
      map.current = m;
      const mm = m;
      mm.touchZoomRotate?.disableRotation();
      try {
        mm.fitBounds(BOUNDS, { padding: latest.current.padding(el), pitch: latest.current.pitch, bearing: 0, duration: 0 });
      } catch {}

      let ready = false;
      let tileErrors = 0;
      const markReady = () => {
        if (ready || disposed) return;
        ready = true;
        placePoints();
        setStatus("ready");
      };
      const armTimeout = () => {
        timers.push(
          window.setTimeout(() => {
            if (ready) return;
            if (document.hidden) armTimeout();
            else setStatus("error");
          }, LOAD_TIMEOUT_MS),
        );
      };
      armTimeout();

      mm.on("error", (e) => {
        if (!ready && (e as { sourceId?: string }).sourceId && ++tileErrors >= MAX_TILE_ERRORS) setStatus("error");
      });
      mm.on("style.load", () => treatRaster(mm, latest.current.isDark));
      mm.on("load", () => {
        treatRaster(mm, latest.current.isDark);
        placePoints();
        mm.once("idle", markReady);
        timers.push(window.setTimeout(markReady, READY_FALLBACK_MS));
      });
      mm.on("webglcontextlost", () => setStatus("error"));
      mm.on("move", () => {
        placePoints();
        latest.current.onMove?.();
      });
      resizeObserver = new ResizeObserver(() => {
        mm.resize();
        if (!focused.current) {
          try {
            mm.fitBounds(BOUNDS, { padding: latest.current.padding(el), pitch: latest.current.pitch, bearing: 0, duration: 0 });
          } catch {}
        }
        placePoints();
      });
      resizeObserver.observe(el);
    };

    // Lazy: only when the map is within 600 px of the viewport.
    const io = new IntersectionObserver(
      (entries) => {
        if (!entries.some((e) => e.isIntersecting)) return;
        io.disconnect();
        setStatus("loading");
        void create();
      },
      { rootMargin: "600px 0px" },
    );
    io.observe(el);

    return () => {
      disposed = true;
      io.disconnect();
      timers.forEach(clearTimeout);
      resizeObserver?.disconnect();
      try {
        m?.remove();
      } catch {}
      map.current = null;
    };
    // Map options are fixed per instance; `attempt` recreates it.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [attempt]);

  // Layout changed across the 1024 px breakpoint: toggle one-finger panning and pinch zoom.
  useEffect(() => {
    const m = map.current;
    if (!m || !interactive) return;
    if (dragPan) {
      m.dragPan.enable();
      m.touchZoomRotate.enable();
      m.touchZoomRotate.disableRotation();
    } else {
      m.dragPan.disable();
      m.touchZoomRotate.disable();
    }
  }, [dragPan, interactive]);

  // Theme switch: re-treat the raster.
  useEffect(() => {
    if (map.current) treatRaster(map.current, isDark);
  }, [isDark]);

  // Points re-rendered (active state, new list): position them again.
  useEffect(() => {
    placePoints();
  });

  return (
    <>
      {/* MapLibre's CSS forces position: relative on the container, so it fills its positioned parent by size. */}
      <div ref={container} role="region" aria-label={label} className={`h-full w-full ${className}`} />
      <div ref={layer} className={`pointer-events-none absolute inset-0 overflow-hidden ${layerClassName}`}>
        {points.map((p, i) => (
          <div key={p.id} data-lng={p.lng} data-lat={p.lat} className="absolute left-0 top-0 h-0 w-0" style={{ transform: "translate3d(-999px,-999px,0)", zIndex: pointZ?.(p, i) }}>
            {renderPoint(p, i)}
          </div>
        ))}
      </div>
    </>
  );
}
