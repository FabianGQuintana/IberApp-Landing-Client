import Link from "next/link";
import { SeverityBadge } from "@/components/admin/ui/SeverityBadge";
import { StatusBadge } from "@/components/admin/ui/StatusBadge";
import { SEVERITY } from "@/lib/admin/labels";
import type { ReportResponse } from "@/types/admin/report";
import { formatCaptureDate } from "./format";
import { detailHref } from "./query";
import { ReportThumb } from "./ReportThumb";

type Props = {
  reports: ReportResponse[];
  /** Current list query string, carried to the detail so it can come back to the same filters */
  query: string;
};

/** The table below 1024 px: one card per report, each card a link to its detail. */
export function ReportCards({ reports, query }: Props) {
  return (
    <ul className="m-0 grid list-none gap-3 p-0 tab:grid-cols-2">
      {reports.map((r) => (
        <li key={r.id} className="min-w-0">
          <Link
            href={detailHref(r.id, query)}
            data-testid="report-row"
            data-report-id={r.id}
            className="flex h-full gap-3.5 rounded-[12px] border border-rule bg-page-2 p-3.5 text-fg no-underline transition-colors hover:border-fg hover:text-fg"
          >
            <ReportThumb url={r.photoUrl} size={72} />
            <span className="flex min-w-0 flex-1 flex-col gap-2">
              <span className="flex flex-wrap items-start justify-between gap-2">
                <span className="text-[16px] font-semibold leading-tight text-head">{r.category || "Sin categoría"}</span>
                <StatusBadge status={r.status} />
              </span>
              {SEVERITY[r.severityLevel] ? <SeverityBadge level={r.severityLevel} /> : null}
              <span className="text-[14px] text-mute [font-variant-numeric:tabular-nums]">
                <time dateTime={r.captureDate}>{formatCaptureDate(r.captureDate)}</time> · {r.reportedBy || "—"}
              </span>
              {r.notes ? <span className="line-clamp-2 text-[14px]">{r.notes}</span> : null}
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
