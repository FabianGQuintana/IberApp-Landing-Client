import type { ReactNode } from "react";
import { SeverityBadge } from "@/components/admin/ui/SeverityBadge";
import { CATEGORIES } from "@/lib/rangers/categories";
import type { ReportCategory } from "@/types/admin/report";

/** The field app has its 4 categories fixed (lib/rangers/categories.ts): only those can be reported from the phone. */
const IN_RANGER_APP = new Set(CATEGORIES.map((c) => c.id));

type Props = {
  /** Already in display order */
  categories: ReportCategory[];
  /** Reports per category id; null while they load (or if they could not be counted) */
  counts: Record<string, number> | null;
  /** The category just created, marked as "Nueva" */
  highlightId: string | null;
};

export function CategoryList({ categories, counts, highlightId }: Props) {
  return (
    <ul className="m-0 flex list-none flex-col gap-3 p-0">
      {categories.map((category) => {
        const isNew = category.id === highlightId;
        return (
          <li
            key={category.id}
            className={`grid gap-x-6 gap-y-3 rounded-[12px] border bg-page-2 p-5 transition-colors sm:grid-cols-[minmax(0,1fr)_auto] ${isNew ? "border-mint" : "border-rule"}`}
          >
            <div className="flex min-w-0 flex-col gap-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="m-0 text-[18px] font-semibold text-head">{category.name}</h3>
                {isNew ? <Tag className="border-mint bg-mint/15">Nueva</Tag> : null}
                {IN_RANGER_APP.has(category.id) ? (
                  <Tag className="border-sky bg-sky/10">
                    <span aria-hidden="true">📱 </span>En la app de guardaparques
                  </Tag>
                ) : null}
              </div>
              <p className="m-0 text-[15px] text-mute">{category.description || "Sin descripción."}</p>
            </div>

            <div className="flex items-center gap-6 sm:flex-col sm:items-end sm:justify-center sm:gap-2">
              <SeverityBadge level={category.severityLevel} />
              {counts ? <span className="text-[14px] text-mute">{reportCount(counts[category.id] ?? 0)}</span> : null}
            </div>
          </li>
        );
      })}
    </ul>
  );
}

function Tag({ className, children }: { className: string; children: ReactNode }) {
  return <span className={`rounded-full border px-2.5 py-1 text-[12px] font-semibold leading-none text-fg ${className}`}>{children}</span>;
}

function reportCount(n: number) {
  if (n === 0) return "Sin reportes";
  return n === 1 ? "1 reporte" : `${n} reportes`;
}
