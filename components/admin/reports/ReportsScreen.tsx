"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { PageHeader } from "@/components/admin/ui/PageHeader";
import { ErrorBox } from "@/components/rangers/ui/ErrorBox";
import { Spinner } from "@/components/rangers/ui/Spinner";
import { useIsDesktop } from "@/hooks/useMediaQuery";
import type { ReportFilter, ReportResponse, ReportStatus } from "@/types/admin/report";
import { EmptyState } from "./EmptyState";
import { reportCount } from "./format";
import { hasFilters, parseReportsQuery, reportsHref, reportsQuery, type ReportsView } from "./query";
import { ReportCards } from "./ReportCards";
import { ReportFilters } from "./ReportFilters";
import { ReportsMap } from "./ReportsMap";
import { ReportTable } from "./ReportTable";
import { StatusSummary } from "./StatusSummary";
import { useFilterOptions, useReports } from "./useReportsData";
import { ViewTabs } from "./ViewTabs";

function countByStatus(reports: ReportResponse[]) {
  const counts: Record<ReportStatus, number> = { Pending: 0, Done: 0, Canceled: 0 };
  for (const r of reports) counts[r.status]++;
  return counts;
}

/**
 * /admin/reportes: status counters, filters, and the reports as a list or on the map.
 * The URL is the only source of the filters and the view, so reloading, sharing and coming back from a
 * report's detail show the same thing.
 */
export function ReportsScreen() {
  const pathname = usePathname();
  const { filter, view } = parseReportsQuery(useSearchParams());
  const query = reportsQuery(filter, view);
  const { reports: matching, loading, error, retry } = useReports(filter);
  const options = useFilterOptions();

  // Next.js syncs useSearchParams with the History API: no server round trip, the inputs answer at once.
  // Filters replace the entry (Back leaves the list instead of undoing each filter); switching the view adds one.
  const navigate = (next: ReportFilter, nextView: ReportsView, mode: "push" | "replace") => {
    const qs = reportsQuery(next, nextView);
    const url = qs ? `${pathname}?${qs}` : pathname;
    if (mode === "push") window.history.pushState(null, "", url);
    else window.history.replaceState(null, "", url);
  };
  const setFilter = (next: ReportFilter) => navigate(next, view, "replace");
  const clear = () => setFilter({});

  const counts = matching ? countByStatus(matching) : null;
  const reports = matching && filter.status ? matching.filter((r) => r.status === filter.status) : matching;
  const filtered = hasFilters(filter);
  const loadError = error ?? options.error;

  return (
    <>
      <PageHeader
        title="Reportes"
        description="Lo que reportan los guardaparques desde el territorio, del más nuevo al más viejo."
        actions={
          <ViewTabs view={view} hrefFor={(v) => reportsHref(reportsQuery(filter, v))} onSelect={(v) => navigate(filter, v, "push")} />
        }
      />

      <StatusSummary counts={counts} active={filter.status} busy={loading} onPick={(status) => setFilter({ ...filter, status })} />

      <ReportFilters
        filter={filter}
        categories={options.categories}
        staff={options.staff}
        optionsFailed={!!options.error}
        onChange={setFilter}
        onClear={clear}
      />

      {loadError ? (
        <div className="flex flex-col items-start gap-3">
          <ErrorBox message={loadError} />
          <button
            type="button"
            onClick={() => {
              if (error) retry();
              if (options.error) options.retry();
            }}
            className="min-h-12 rounded-[10px] border border-rule bg-transparent px-5 text-[16px] font-semibold text-fg transition-colors hover:border-fg"
          >
            Reintentar
          </button>
        </div>
      ) : null}

      {error ? null : view === "map" ? (
        <ReportsMap
          reports={reports}
          loading={loading}
          framingKey={reportsQuery(filter, "list")}
          query={query}
          filtered={filtered}
          onClear={clear}
        />
      ) : (
        <ReportList reports={reports} loading={loading} query={query} filtered={filtered} onClear={clear} />
      )}
    </>
  );
}

type ListProps = {
  reports: ReportResponse[] | null;
  loading: boolean;
  query: string;
  filtered: boolean;
  onClear: () => void;
};

/** Table on desktop, cards below 1024 px (only one is rendered, so each report appears once). */
function ReportList({ reports, loading, query, filtered, onClear }: ListProps) {
  const wide = useIsDesktop();

  if (!reports || (loading && reports.length === 0)) return <Spinner label="Cargando reportes…" />;
  if (reports.length === 0) return <EmptyState filtered={filtered} onClear={onClear} className="rounded-[12px] border border-dashed border-rule" />;

  return (
    <section aria-label="Lista de reportes" aria-busy={loading} className="flex flex-col gap-3">
      <p role="status" className="m-0 text-[15px] font-medium text-mute">
        {loading ? "Actualizando…" : reportCount(reports.length)}
      </p>
      <div className={`transition-opacity ${loading ? "opacity-60" : ""}`}>
        {wide ? <ReportTable reports={reports} query={query} /> : <ReportCards reports={reports} query={query} />}
      </div>
    </section>
  );
}
