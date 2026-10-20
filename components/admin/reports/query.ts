import type { ReportFilter, ReportStatus } from "@/types/admin/report";

// The list and the map keep their filters and view in the URL, so they can be shared, reloaded and restored:
// /admin/reportes?status=&categoryId=&reportedById=&from=YYYY-MM-DD&to=YYYY-MM-DD&view=list|map

export type ReportsView = "list" | "map";

export const REPORTS_PATH = "/admin/reportes";

const STATUSES: ReportStatus[] = ["Pending", "Done", "Canceled"];
const DATE_ONLY = /^\d{4}-\d{2}-\d{2}$/;
/** URL order of the filters (the view goes last) */
const KEYS = ["status", "categoryId", "reportedById", "from", "to"] as const;

/** Filters and view from the query string. Values the panel cannot produce (a bad status or date) are dropped. */
export function parseReportsQuery(params: { get(name: string): string | null }): { filter: ReportFilter; view: ReportsView } {
  const text = (name: string) => params.get(name)?.trim() || undefined;
  const date = (name: string) => {
    const value = text(name);
    return value && DATE_ONLY.test(value) ? value : undefined;
  };
  const status = text("status");
  return {
    filter: {
      status: STATUSES.find((s) => s === status),
      categoryId: text("categoryId"),
      reportedById: text("reportedById"),
      from: date("from"),
      to: date("to"),
    },
    view: params.get("view") === "map" ? "map" : "list",
  };
}

/** Query string (without "?") for these filters and view; the list is the default view and is left out. */
export function reportsQuery(filter: ReportFilter, view: ReportsView): string {
  const params = new URLSearchParams();
  for (const key of KEYS) {
    const value = filter[key];
    if (value) params.set(key, value);
  }
  if (view === "map") params.set("view", "map");
  return params.toString();
}

export const reportsHref = (query: string) => (query ? `${REPORTS_PATH}?${query}` : REPORTS_PATH);

/** Detail link that carries the list's query string, so "Volver a reportes" restores filters and view (ticket 07). */
export const detailHref = (id: string, query: string) =>
  `${REPORTS_PATH}/${encodeURIComponent(id)}${query ? `?back=${encodeURIComponent(query)}` : ""}`;

export const hasFilters = (filter: ReportFilter) => KEYS.some((key) => !!filter[key]);
