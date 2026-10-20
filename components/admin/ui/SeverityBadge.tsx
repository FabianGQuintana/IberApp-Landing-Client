import { SEVERITY } from "@/lib/admin/labels";
import type { SeverityLevel } from "@/types/admin/report";

const BARS = [0, 1, 2, 3, 4];

/** Severity as five rising bars (filled up to its rank) plus the label, so it never looks like a status pill. */
export function SeverityBadge({ level }: { level: SeverityLevel }) {
  const { label, color, rank } = SEVERITY[level];
  return (
    <span className="inline-flex items-center gap-2 whitespace-nowrap text-[13px] font-semibold leading-none text-fg">
      <span aria-hidden="true" className="flex items-end gap-[2px]">
        {BARS.map((i) => (
          <span key={i} className="w-[3px] rounded-[1px]" style={{ height: 5 + i * 2.5, background: i <= rank ? color : "var(--rule)" }} />
        ))}
      </span>
      {label}
    </span>
  );
}
