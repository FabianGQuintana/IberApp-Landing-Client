import { useId, type ReactNode } from "react";

/** Card of the report detail: a small uppercase heading over its content. */
export function Panel({ title, children }: { title: string; children: ReactNode }) {
  const id = useId();
  return (
    <section aria-labelledby={id} className="flex flex-col gap-4 rounded-[12px] border border-rule bg-page-2 p-5">
      <h2 id={id} className="eyebrow m-0 text-mute">
        {title}
      </h2>
      {children}
    </section>
  );
}

/** Label and value pair inside a panel ("Reportado por", "Captura"…). */
export function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <dt className="text-[13px] font-medium text-mute">{label}</dt>
      <dd className="m-0 text-[16px] text-fg">{children}</dd>
    </div>
  );
}

/** Button sizes of the panel (desktop): same radius and weight as the header and the demo strip. */
export const BUTTON = {
  base: "inline-flex min-h-11 items-center justify-center gap-2 rounded-[10px] px-4 text-[15px] font-semibold no-underline transition-colors disabled:cursor-not-allowed disabled:opacity-60",
  primary: "bg-mint text-night hover:bg-leaf hover:text-night",
  neutral: "border border-rule bg-transparent text-fg hover:border-fg hover:text-fg",
};
