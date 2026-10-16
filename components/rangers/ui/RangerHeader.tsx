"use client";

import Link from "next/link";
import { Logo } from "@/components/layout/Logo";
import { ThemeToggle } from "@/components/theme/ThemeToggle";

type Props = { onBack?: () => void };

/** Same brand block as the landing header (isotype + "Iberá · Guardaparques") and the same theme toggle. */
export function RangerHeader({ onBack }: Props) {
  return (
    <header className="sticky top-0 z-20 flex h-[68px] items-center justify-between gap-3 border-b border-navline bg-navglass px-5 backdrop-blur-[18px]">
      {onBack ? (
        <button
          type="button"
          onClick={onBack}
          className="flex h-10 items-center gap-2 rounded-[10px] border border-rule bg-transparent px-3.5 text-[15px] font-medium text-fg transition-colors hover:border-fg"
        >
          <span aria-hidden="true">←</span> Volver
        </button>
      ) : (
        <Link href="/" className="flex items-center gap-3 text-head no-underline hover:opacity-90" aria-label="Ir a la página principal de Iberá">
          <Logo className="h-7 w-[52px]" />
          <span className="flex flex-col items-start gap-1 border-l border-rule pl-3">
            <span className="title-display text-[17px] leading-[0.9]">Iberá</span>
            <span className="text-[11px] font-medium uppercase leading-none tracking-[.08em] text-mute">Guardaparques</span>
          </span>
        </Link>
      )}
      <ThemeToggle color="var(--fg)" borderColor="var(--rule)" />
    </header>
  );
}
