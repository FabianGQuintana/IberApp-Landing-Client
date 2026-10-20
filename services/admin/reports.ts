import { DEMO_MODE } from "@/lib/rangers/demo";
import { ApiError } from "@/lib/api/client";
import { adminApi as apiFetch } from "@/lib/admin/session";
import { demoServer } from "@/lib/demo-server";
import type { ReportFilter, ReportResponse, ReportStatus } from "@/types/admin/report";

const DATE_ONLY = /^\d{4}-\d{2}-\d{2}$/;

/**
 * A date-only bound ("YYYY-MM-DD", as the filters keep it) becomes the start or the end of that day in
 * Argentina (UTC-3, no DST), the same time zone the panel shows dates in, whatever the browser's zone.
 * The backend compares from/to as instants (CaptureDate <= to), so a bare "2026-10-20" would leave out
 * everything captured that day after 00:00 UTC.
 */
function dayBound(value: string | undefined, end: boolean) {
  if (!value || !DATE_ONLY.test(value)) return value;
  return new Date(`${value}T${end ? "23:59:59.999" : "00:00:00.000"}-03:00`).toISOString();
}

/** The backend answers 404 without a body for an id that is not a GUID: same error either way */
function notFoundAsApiError(err: unknown): never {
  if (err instanceof ApiError && err.status === 404) throw new ApiError(404, "NOT_FOUND", "El reporte no existe.");
  throw err;
}

/** All the reports that match, newest first (no paging, like the API). */
export async function getReports(filter: ReportFilter = {}): Promise<ReportResponse[]> {
  const query: ReportFilter = { ...filter, from: dayBound(filter.from, false), to: dayBound(filter.to, true) };
  if (DEMO_MODE) return demoServer.getReports(query);

  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) if (value) params.set(key, value);
  const qs = params.toString();
  return apiFetch<ReportResponse[]>(`/api/reports${qs ? `?${qs}` : ""}`);
}

/** Throws ApiError(404, "NOT_FOUND", "El reporte no existe.") when there is no such report. */
export async function getReport(id: string): Promise<ReportResponse> {
  if (DEMO_MODE) return demoServer.getReport(id);
  return apiFetch<ReportResponse>(`/api/reports/${encodeURIComponent(id)}`).catch(notFoundAsApiError);
}

/** Admin only. Any transition is allowed; returns the updated report. */
export async function updateReportStatus(id: string, status: ReportStatus): Promise<ReportResponse> {
  if (DEMO_MODE) return demoServer.updateReportStatus(id, status);
  return apiFetch<ReportResponse>(`/api/reports/${encodeURIComponent(id)}/status`, {
    method: "PATCH",
    json: { status },
  }).catch(notFoundAsApiError);
}
