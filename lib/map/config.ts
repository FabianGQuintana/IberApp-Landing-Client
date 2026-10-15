// Map configuration taken from Ibera Landing v6 (BOUNDS, PELLEGRINI, MAP_CONFIG, satStyle(), mainPad(), padFor()).
import type { PaddingOptions, StyleSpecification } from "maplibre-gl";

export const BOUNDS: [[number, number], [number, number]] = [
  [-58.0692, -28.6549],
  [-56.6969, -27.8572],
];

export const PELLEGRINI: [number, number] = [-57.1745, -28.5405];


/** v6 prop `tilt`: pitch of the territory map on desktop (0–15). */
export const MAIN_PITCH = 6;

const ESRI = "https://server.arcgisonline.com/ArcGIS/rest/services/";
const maptilerKey = () => process.env.NEXT_PUBLIC_MAPTILER_KEY ?? "";

export const mapProvider = () => (maptilerKey() ? "maptiler" : "esri");

/** MapTiler Hybrid when a key is set; otherwise Esri World Imagery + reference layers (keyless, fine for development). */
export function satStyle(): string | StyleSpecification {
  const key = maptilerKey();
  if (key) return `https://api.maptiler.com/maps/hybrid/style.json?key=${key}`;
  const raster = (path: string) => ({ type: "raster" as const, tiles: [`${ESRI}${path}/MapServer/tile/{z}/{y}/{x}`], tileSize: 256, maxzoom: 19 });
  return {
    version: 8,
    sources: {
      sat: raster("World_Imagery"),
      roads: raster("Reference/World_Transportation"),
      places: raster("Reference/World_Boundaries_and_Places"),
    },
    layers: [
      { id: "bg", type: "background", paint: { "background-color": "#0B100E" } },
      { id: "sat", type: "raster", source: "sat", paint: { "raster-fade-duration": 300 } },
      { id: "roads", type: "raster", source: "roads", paint: { "raster-opacity": 0.45 } },
      { id: "places", type: "raster", source: "places", paint: { "raster-opacity": 0.85 } },
    ],
  };
}

export const attribution = () =>
  mapProvider() === "maptiler" ? "© MapTiler · © colaboradores de OpenStreetMap" : "Imágenes: Esri, Maxar, Earthstar Geographics · Referencias: Esri";

export const attributionShort = () => (mapProvider() === "maptiler" ? "© MapTiler © OSM" : "© Esri, Maxar");

/** Territory map padding by layout (v6 mainPad): phone < 700, tablet < 1024, desktop leaves room for the text column. */
export function mainPadding(width: number): PaddingOptions {
  if (width < 700) return { top: 56, bottom: 48, left: 36, right: 36 };
  if (width < 1024) return { top: 90, bottom: 90, left: 64, right: 84 };
  const column = Math.min(width * 0.28, 380) + Math.min(64, Math.max(24, width * 0.04));
  return { top: 130, bottom: 120, left: column + 90, right: 150 };
}

/** Padding for small maps (v6 padFor). */
export function smallPadding(el: HTMLElement): PaddingOptions {
  const w = el.clientWidth;
  const h = el.clientHeight;
  return { top: Math.min(48, h * 0.14), bottom: Math.min(48, h * 0.14), left: Math.min(56, w * 0.1), right: Math.min(56, w * 0.1) };
}

/** "28,546° S · 57,196° O" (v6 fmt) */
export const formatDegrees = (lat: number, lng: number) =>
  `${Math.abs(lat).toFixed(3).replace(".", ",")}° S · ${Math.abs(lng).toFixed(3).replace(".", ",")}° O`;
