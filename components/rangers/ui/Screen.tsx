import type { ReactNode } from "react";
import { RangerHeader } from "@/components/rangers/ui/RangerHeader";
import { OfflineBanner } from "@/components/rangers/ui/OfflineBanner";

type Props = {
  title: ReactNode;
  /** Shows a "Volver" button in the header */
  onBack?: () => void;
  /** Content pinned to the bottom (e.g. the "Guardar" button), always reachable with the thumb */
  footer?: ReactNode;
  children: ReactNode;
};

/** Layout of every rangers view: the landing's header, a title, scrollable content and an optional fixed footer. */
export function Screen({ title, onBack, footer, children }: Props) {
  return (
    <div className="mx-auto flex min-h-svh w-full max-w-xl flex-col bg-page text-fg">
      <RangerHeader onBack={onBack} />
      <OfflineBanner />

      <main className="flex flex-1 flex-col gap-6 px-5 pb-8 pt-6">
        <h1 className="title-display text-[clamp(30px,8vw,40px)] leading-[0.95] text-head">{title}</h1>
        {children}
      </main>

      {footer ? (
        <div className="sticky bottom-0 border-t border-rule bg-page/90 px-5 pt-3 backdrop-blur-md" style={{ paddingBottom: "max(1rem, env(safe-area-inset-bottom))" }}>
          {footer}
        </div>
      ) : null}
    </div>
  );
}
