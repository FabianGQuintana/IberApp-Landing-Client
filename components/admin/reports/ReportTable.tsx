"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import type { MouseEvent } from "react";
import { SeverityBadge } from "@/components/admin/ui/SeverityBadge";
import { StatusBadge } from "@/components/admin/ui/StatusBadge";
import { SEVERITY } from "@/lib/admin/labels";
import type { ReportResponse } from "@/types/admin/report";
import { formatCaptureDate } from "./format";
import { detailHref } from "./query";
import { ReportThumb } from "./ReportThumb";

const COLUMNS = ["Foto", "Categoría", "Estado", "Reportado por", "Captura", "Nota"];

type Props = {
  reports: ReportResponse[];
  /** Current list query string, carried to the detail so it can come back to the same filters */
  query: string;
};

/**
 * Desktop table, in the API's order (newest first). The category is the row's link, so the keyboard reaches
 * every report with Tab; a click anywhere else on the row opens it too.
 */
export function ReportTable({ reports, query }: Props) {
  const router = useRouter();

  const openRow = (e: MouseEvent<HTMLTableRowElement>, href: string) => {
    // The link handles its own clicks; selecting text is not a click on the row
    if ((e.target as HTMLElement).closest("a, button") || window.getSelection()?.toString()) return;
    if (e.metaKey || e.ctrlKey) window.open(href, "_blank", "noopener");
    else router.push(href);
  };

  return (
    <div className="overflow-hidden rounded-[12px] border border-rule">
      <table className="w-full border-collapse text-left text-[15px]">
        <caption className="sr-only">Reportes, del más nuevo al más viejo. Abrí uno para ver el detalle y cambiar su estado.</caption>
        <thead className="bg-page-2">
          <tr>
            {COLUMNS.map((c) => (
              <th key={c} scope="col" className="eyebrow px-4 py-3 font-semibold text-mute">
                {c}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {reports.map((r) => {
            const href = detailHref(r.id, query);
            return (
              <tr
                key={r.id}
                data-testid="report-row"
                data-report-id={r.id}
                onClick={(e) => openRow(e, href)}
                className="cursor-pointer border-t border-rule align-middle transition-colors hover:bg-page-2 focus-within:bg-page-2"
              >
                <td className="w-[88px] px-4 py-3">
                  <ReportThumb url={r.photoUrl} />
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-col items-start gap-2">
                    <Link href={href} className="font-semibold text-head no-underline hover:text-head hover:underline">
                      {r.category || "Sin categoría"}
                    </Link>
                    {SEVERITY[r.severityLevel] ? <SeverityBadge level={r.severityLevel} /> : null}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <StatusBadge status={r.status} />
                </td>
                <td className="whitespace-nowrap px-4 py-3">{r.reportedBy || "—"}</td>
                <td className="whitespace-nowrap px-4 py-3 [font-variant-numeric:tabular-nums]">
                  <time dateTime={r.captureDate}>{formatCaptureDate(r.captureDate)}</time>
                </td>
                <td className="px-4 py-3 text-mute">
                  <span className="line-clamp-2 max-w-[40ch]">{r.notes ?? "Sin nota"}</span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
