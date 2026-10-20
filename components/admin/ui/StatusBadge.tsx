import { REPORT_STATUS } from "@/lib/admin/labels";
import type { ReportStatus } from "@/types/admin/report";

/** Report status as a pill: the palette color goes on the dot and the tint, the label stays in the text color (readable in both themes). */
export function StatusBadge({ status }: { status: ReportStatus }) {
  const { label, color } = REPORT_STATUS[status];
  return (
    <span
      className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border px-2.5 py-1 text-[13px] font-semibold leading-none text-fg"
      style={{ borderColor: `color-mix(in srgb, ${color} 60%, transparent)`, background: `color-mix(in srgb, ${color} 16%, transparent)` }}
    >
      <span aria-hidden="true" className="size-2 shrink-0 rounded-full" style={{ background: color }} />
      {label}
    </span>
  );
}
