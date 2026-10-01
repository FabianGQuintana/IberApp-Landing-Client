/** Formats a report code: 427 → "IB-0427". */
export const formatReportCode = (n: number) => `IB-${String(n).padStart(4, "0")}`;

/** Short Spanish date ("2 sep"), fixed to Argentina's time zone so server and client agree. */
export function formatShortDate(iso: string) {
  return new Intl.DateTimeFormat("es-AR", { day: "numeric", month: "short", timeZone: "America/Argentina/Buenos_Aires" })
    .format(new Date(iso))
    .replace(".", "");
}

export const formatCoords = (lat: number, lng: number) => `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
