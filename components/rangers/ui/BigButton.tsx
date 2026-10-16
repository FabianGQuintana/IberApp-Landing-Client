import type { ComponentPropsWithRef, ReactNode } from "react";

type Variant = "primary" | "sync" | "danger" | "neutral";

// Same language as the landing buttons: solid fills, 10–12 px radius, Barlow. Mint is the action color of the park.
const VARIANTS: Record<Variant, string> = {
  primary: "bg-mint text-night hover:bg-leaf",
  sync: "bg-btn text-btn-fg hover:opacity-90",
  danger: "bg-[#e5484d] text-white hover:bg-[#d13a3f]",
  neutral: "border border-rule bg-transparent text-fg hover:border-fg",
};

type Props = ComponentPropsWithRef<"button"> & {
  variant?: Variant;
  /** Emoji or icon shown above (hero) or before (large) the label */
  icon?: ReactNode;
  /** "hero": tall card for the dashboard; "large": full width, 56 px tall */
  size?: "hero" | "large";
  children: ReactNode;
};

/**
 * Main button of the rangers module: full width and never smaller than 56 px tall (rule: ≥ 48 px),
 * so it is easy to hit with one hand, but sized like the rest of the site.
 */
export function BigButton({ variant = "primary", icon, size = "large", className = "", children, ...rest }: Props) {
  const sizing =
    size === "hero"
      ? "min-h-[24svh] flex-col items-start justify-end gap-3 rounded-[12px] p-6 text-left title-display text-[clamp(28px,8vw,40px)] leading-[0.95]"
      : "min-h-14 items-center justify-center gap-2.5 rounded-[10px] px-5 text-[17px] font-semibold";

  return (
    <button
      type="button"
      className={`flex w-full touch-manipulation select-none transition-[transform,background-color,opacity,border-color] duration-300 ease-[var(--ease-soft)] active:scale-[0.985] disabled:cursor-not-allowed disabled:opacity-50 ${VARIANTS[variant]} ${sizing} ${className}`}
      {...rest}
    >
      {icon ? (
        <span aria-hidden="true" className={size === "hero" ? "text-[2.6rem] leading-none" : "text-[1.3rem] leading-none"}>
          {icon}
        </span>
      ) : null}
      <span>{children}</span>
    </button>
  );
}
