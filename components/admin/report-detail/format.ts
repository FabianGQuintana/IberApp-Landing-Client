import { ApiError, OfflineError } from "@/lib/api/client";

// Formats and messages of the report detail. Dates always in Argentina time, whatever the browser's zone.

const DATE_TIME = new Intl.DateTimeFormat("es-AR", {
  timeZone: "America/Argentina/Buenos_Aires",
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  hourCycle: "h23",
});

/** "20/10/2026, 14:32 hs" */
export const formatDateTime = (iso: string) => `${DATE_TIME.format(new Date(iso))} hs`;

/** "-28.5424, -57.1841": 4 decimals (about 10 m), with a dot so it pastes into any map */
export const formatCoords = (lat: number, lng: number) => `${lat.toFixed(4)}, ${lng.toFixed(4)}`;

/** "850 m" under 1 km, then "3,2 km" */
export function formatDistance(km: number) {
  const meters = Math.round(km * 1000);
  return meters < 1000 ? `${meters} m` : `${km.toLocaleString("es-AR", { maximumFractionDigits: 1 })} km`;
}

export const googleMapsUrl = (lat: number, lng: number) => `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;

/** What to tell the admin when a request fails: the server's message when it sent one. */
export function errorMessage(err: unknown, fallback: string) {
  if (err instanceof OfflineError) return "Sin conexión con el servidor. Revisá la conexión y probá de nuevo.";
  return err instanceof ApiError ? err.message : fallback;
}

/** "← Volver a reportes": back to the list with the filters it had (the `back` query string it sent) */
export function listHref(back: string | undefined) {
  const query = back?.replace(/^\?/, "");
  return query ? `/admin/reportes?${query}` : "/admin/reportes";
}
