"use client";

import { useEffect, useRef } from "react";
import { BigButton } from "@/components/rangers/ui/BigButton";

type Props = {
  title: string;
  message?: string;
  buttonLabel?: string;
  onClose: () => void;
};

/**
 * Full screen "it worked" confirmation: a big mint check that is impossible to miss,
 * plus a short vibration (on phones that allow it) so the ranger feels it in the hand.
 */
export function SuccessOverlay({ title, message, buttonLabel = "Listo", onClose }: Props) {
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    buttonRef.current?.focus();
    try {
      navigator.vibrate?.(120);
    } catch {}
  }, []);

  return (
    <div
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="success-title"
      className="fixed inset-0 z-50 flex animate-ib-fadeup flex-col items-center justify-center gap-5 bg-page px-6 text-fg"
      style={{ paddingBottom: "max(1.5rem, env(safe-area-inset-bottom))" }}
    >
      <span aria-hidden="true" className="flex size-32 items-center justify-center rounded-full bg-mint text-[4rem] leading-none text-night">
        ✓
      </span>
      <h2 id="success-title" className="title-display m-0 text-center text-[clamp(32px,9vw,44px)] leading-[0.95] text-head">
        {title}
      </h2>
      {message ? <p className="m-0 max-w-md text-center text-[17px] text-mute">{message}</p> : null}
      <div className="mt-2 w-full max-w-md">
        <BigButton ref={buttonRef} onClick={onClose}>
          {buttonLabel}
        </BigButton>
      </div>
    </div>
  );
}
