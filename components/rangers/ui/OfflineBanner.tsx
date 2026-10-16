"use client";

import { useOnline } from "@/hooks/rangers/useOnline";

/** Tells the ranger, without alarming, that there is no signal and that everything is still saved on the phone. */
export function OfflineBanner() {
  const online = useOnline();
  if (online) return null;

  return (
    <p role="status" className="m-0 flex items-center justify-center gap-2 bg-orange px-5 py-2.5 text-center text-[15px] font-semibold text-night">
      <span aria-hidden="true">📵</span>Sin señal. Lo que guardes queda en el teléfono.
    </p>
  );
}
