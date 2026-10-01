import type { ButtonHTMLAttributes, ComponentProps, ReactNode } from "react";

// Small controls repeated across Ibera Landing v6.

const ARROW_PATHS = {
  left: "M19 12H5M11 6l-6 6 6 6",
  right: "M5 12h14M13 6l6 6-6 6",
  close: "M6 6l12 12M18 6L6 18",
};

export function LineIcon({ name, size = 20 }: { name: keyof typeof ARROW_PATHS; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={ARROW_PATHS[name]} />
    </svg>
  );
}

/** 44 px round outline button with an arrow (rail, gallery). Nudges toward its direction on hover. */
export function RoundArrowButton({ direction, ...props }: { direction: "left" | "right" } & ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      {...props}
      className={`flex h-11 w-11 flex-none items-center justify-center rounded-full border border-rule bg-transparent p-0 text-head transition-[border-color,transform] duration-[450ms] ease-[cubic-bezier(.3,1.2,.4,1)] hover:border-head ${
        direction === "left" ? "hover:-translate-x-1" : "hover:translate-x-1"
      }`}
    >
      <LineIcon name={direction} />
    </button>
  );
}

/** Round glass button over photos (lightbox, map dialog). */
export function GlassButton({ size = 44, children, className = "", style, ...props }: { size?: number; children: ReactNode } & ComponentProps<"button">) {
  return (
    <button
      type="button"
      {...props}
      className={`flex items-center justify-center rounded-full border border-white/10 bg-[rgba(12,20,16,.55)] p-0 text-white shadow-[inset_0_1px_rgba(255,255,255,.05)] backdrop-blur-[18px] backdrop-saturate-[1.2] transition-transform duration-[450ms] ease-[cubic-bezier(.3,1.2,.4,1)] hover:scale-[1.04] ${className}`}
      style={{ width: size, height: size, ...style }}
    >
      {children}
    </button>
  );
}

/** Underlined text action with an arrow whose gap grows on hover (v6 "Explorar portal →"). */
export function TextAction({ children, arrow, className = "", ...props }: { children: ReactNode; arrow?: string } & ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      {...props}
      className={`inline-flex items-center gap-2 self-start border-none bg-[linear-gradient(currentColor,currentColor)] bg-[length:100%_1px] bg-left-bottom bg-no-repeat p-0 pb-1.5 text-left text-base font-medium leading-none transition-[gap] duration-[450ms] ease-[cubic-bezier(.3,1.2,.4,1)] hover:gap-3 ${className}`}
    >
      {children}
      {arrow && <span>{arrow}</span>}
    </button>
  );
}

/** 7 px status dot. */
export const Dot = ({ color, className = "" }: { color: string; className?: string }) => (
  <span className={`inline-block h-[7px] w-[7px] flex-none rounded-full ${className}`} style={{ background: color }} />
);
