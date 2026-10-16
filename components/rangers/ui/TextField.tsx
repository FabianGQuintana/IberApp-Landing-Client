import type { ComponentPropsWithRef } from "react";

type Props = ComponentPropsWithRef<"input"> & { label: string; hint?: string };

/** Input with an always-visible label (never placeholder-only: older users forget what the field was). */
export function TextField({ label, hint, id, className = "", ...rest }: Props) {
  const inputId = id ?? `field-${label.replace(/\s+/g, "-").toLowerCase()}`;
  return (
    <label htmlFor={inputId} className="flex flex-col gap-2">
      <span className="eyebrow text-mute">{label}</span>
      <input
        id={inputId}
        className={`min-h-14 w-full rounded-[10px] border border-rule bg-page-2 px-4 text-[17px] text-fg outline-none transition-colors focus:border-mint ${className}`}
        {...rest}
      />
      {hint ? <span className="text-[14px] text-mute">{hint}</span> : null}
    </label>
  );
}
