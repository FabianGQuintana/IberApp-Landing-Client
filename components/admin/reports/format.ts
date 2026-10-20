// Capture dates are shown in Argentina time, wherever the admin's browser is.
const AR_DATE = new Intl.DateTimeFormat("es-AR", {
  timeZone: "America/Argentina/Buenos_Aires",
  day: "numeric",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  hourCycle: "h23",
});

const partsOf = (date: Date) => Object.fromEntries(AR_DATE.formatToParts(date).map((p) => [p.type, p.value]));

/** "12 oct · 09:40"; the year is added only when it is not the current one ("12 oct 2025 · 09:40"). */
export function formatCaptureDate(iso: string) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "Sin fecha";
  const p = partsOf(date);
  const year = p.year !== partsOf(new Date()).year ? ` ${p.year}` : "";
  return `${p.day} ${p.month.replace(".", "")}${year} · ${p.hour}:${p.minute}`;
}

/** "1 reporte" / "12 reportes" */
export const reportCount = (n: number) => `${n} ${n === 1 ? "reporte" : "reportes"}`;
