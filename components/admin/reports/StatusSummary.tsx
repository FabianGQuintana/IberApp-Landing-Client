import { REPORT_STATUS } from "@/lib/admin/labels";
import type { ReportStatus } from "@/types/admin/report";

const ITEMS: { status: ReportStatus; label: string }[] = [
  { status: "Pending", label: "Pendientes" },
  { status: "Done", label: "Resueltos" },
  { status: "Canceled", label: "Cancelados" },
];

type Props = {
  /** Reports per status under the other filters; null until the first answer */
  counts: Record<ReportStatus, number> | null;
  active?: ReportStatus;
  busy: boolean;
  /** Picks that status, or drops it when it is already the active one */
  onPick: (status: ReportStatus | undefined) => void;
};

/** "Pendientes · Resueltos · Cancelados" counters. Each one is a shortcut to the status filter. */
export function StatusSummary({ counts, active, busy, onPick }: Props) {
  return (
    <div role="group" aria-label="Reportes por estado" aria-busy={busy} className="grid grid-cols-3 gap-2 tab:gap-3">
      {ITEMS.map(({ status, label }) => {
        const on = active === status;
        const { color } = REPORT_STATUS[status];
        const count = counts?.[status];
        return (
          <button
            key={status}
            type="button"
            data-testid={`count-${status}`}
            data-count={count ?? ""}
            aria-pressed={on}
            onClick={() => onPick(on ? undefined : status)}
            className="flex min-w-0 flex-col items-start gap-1.5 rounded-[12px] border bg-page-2 px-3 py-3 text-left transition-colors hover:border-fg tab:px-5 tab:py-4"
            style={{
              borderColor: on ? color : "var(--rule)",
              background: on ? `color-mix(in srgb, ${color} 14%, var(--bg2))` : undefined,
            }}
          >
            <span className="flex items-center gap-2">
              <span aria-hidden="true" className="size-2.5 shrink-0 rounded-full" style={{ background: color }} />
              <span className={`title-display text-[30px] leading-none text-head [font-variant-numeric:tabular-nums] tab:text-[40px] ${busy ? "opacity-60" : ""}`}>
                {count ?? "–"}
              </span>
            </span>
            <span className="text-[14px] font-semibold text-mute tab:text-[15px]">{label}</span>
          </button>
        );
      })}
    </div>
  );
}
