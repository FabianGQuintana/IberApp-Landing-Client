// Map configuration taken from Ibera Landing v6 (BOUNDS, PELLEGRINI, satStyle()).
import type { StyleSpecification } from "maplibre-gl";

export const BOUNDS: [[number, number], [number, number]] = [
  [-58.0692, -28.6549],
  [-56.6969, -27.8572],
];

export const PELLEGRINI: [number, number] = [-57.1745, -28.5405];

/** Accepted area (with margin) used to validate report locations. */
export const REPORT_AREA = { minLng: -58.6, maxLng: -56.2, minLat: -29.1, maxLat: -27.4 };

const ESRI = "https://server.arcgisonline.com/ArcGIS/rest/services/";

/** MapTiler when a key is set; otherwise Esri World Imagery (fine for development). */
export function satStyle(): string | StyleSpecification {
  const key = process.env.NEXT_PUBLIC_MAPTILER_KEY;
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
      { id: "sat", type: "raster", source: "sat", paint: { "raster-saturation": -0.15, "raster-contrast": 0.08 } },
      { id: "roads", type: "raster", source: "roads", paint: { "raster-opacity": 0.45 } },
      { id: "places", type: "raster", source: "places", paint: { "raster-opacity": 0.85 } },
    ],
  };
}

export const ATTRIBUTION = process.env.NEXT_PUBLIC_MAPTILER_KEY
  ? "© MapTiler · © colaboradores de OpenStreetMap"
  : "Imágenes: Esri, Maxar, Earthstar Geographics";

/** Rough linear projection over BOUNDS, only for the static fallback map. */
export function toPercent(lat: number, lng: number) {
  const [[w, s], [e, n]] = BOUNDS;
  const x = ((lng - w) / (e - w)) * 80 + 10;
  const y = ((n - lat) / (n - s)) * 80 + 10;
  return { x, y };
}
