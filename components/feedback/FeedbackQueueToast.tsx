"use client";

import { Icon } from "@/components/ui/Icon";
import { useFeedbackQueue } from "@/hooks/useFeedbackQueue";

/** Sends valuations saved without signal and tells the visitor when they go out. */
export function FeedbackQueueToast() {
  const { pending, justSent } = useFeedbackQueue();
  const text = justSent
    ? justSent === 1
      ? "Volvió la señal: enviamos tu valoración guardada."
      : `Volvió la señal: enviamos ${justSent} valoraciones guardadas.`
    : pending
      ? pending === 1
        ? "Tenés 1 valoración guardada. Se envía sola cuando haya señal."
        : `Tenés ${pending} valoraciones guardadas. Se envían solas cuando haya señal.`
      : "";

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-[84px] right-[clamp(16px,4vw,64px)] tab:bottom-6 z-[56] flex max-w-[min(360px,calc(100vw-32px))] items-center gap-2.5 rounded-[12px] border border-white/10 bg-[rgba(12,20,16,.78)] px-4 py-3 text-sm leading-[1.35] text-white backdrop-blur-[18px]"
      style={{ opacity: text ? 1 : 0, pointerEvents: "none", transition: "opacity .4s" }}
    >
      {text && <Icon name={justSent ? "check" : "clock"} size={18} color={justSent ? "#00B96C" : "#FACD05"} knockout="#0C1410" />}
      {text}
    </div>
  );
}
