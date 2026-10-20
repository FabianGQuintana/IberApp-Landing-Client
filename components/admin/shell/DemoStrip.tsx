"use client";

import { useState } from "react";
import { ADMIN_CONTAINER } from "@/components/admin/shell/container";
import { ErrorBox } from "@/components/rangers/ui/ErrorBox";
import { resetDemoServer } from "@/lib/demo-server";

type Props = {
  /** Called once the demo server is back to its seed, so the shell reloads the page's data */
  onReset: () => void;
};

type Step = "idle" | "confirm" | "busy" | "done";

/** "Modo demostración" strip of the panel, with the reset of the demo data (asks before doing it). */
export function DemoStrip({ onReset }: Props) {
  const [step, setStep] = useState<Step>("idle");
  const [error, setError] = useState<string | null>(null);

  const reset = async () => {
    setStep("busy");
    setError(null);
    try {
      await resetDemoServer();
      setStep("done");
      onReset();
    } catch {
      setError("No pudimos restablecer los datos. Probá de nuevo.");
      setStep("confirm");
    }
  };

  return (
    <div className="border-b border-mint/40 bg-mint/10 text-[14px] text-fg">
      <div className={`${ADMIN_CONTAINER} flex flex-wrap items-center gap-x-4 gap-y-2 py-2.5`}>
        <p className="m-0 min-w-[16rem] flex-1">
          🧪 <strong>Modo demostración.</strong> Los datos viven en este navegador: lo que sincronizan los guardaparques en /rangers aparece acá.
        </p>

        {step === "confirm" || step === "busy" ? (
          <div role="alertdialog" aria-labelledby="reset-question" className="flex flex-wrap items-center gap-2">
            <span id="reset-question" className="font-semibold">
              ¿Volver a los datos iniciales? Se pierden los cambios de estado, las categorías nuevas y los reportes sincronizados.
            </span>
            <button
              type="button"
              onClick={reset}
              disabled={step === "busy"}
              aria-busy={step === "busy"}
              className="min-h-10 rounded-[10px] bg-[#e5484d] px-3.5 font-semibold text-white transition-colors hover:bg-[#d13a3f] disabled:opacity-60"
            >
              {step === "busy" ? "Restableciendo…" : "Sí, restablecer"}
            </button>
            <button
              type="button"
              onClick={() => setStep("idle")}
              disabled={step === "busy"}
              className="min-h-10 rounded-[10px] border border-rule bg-transparent px-3.5 font-semibold text-fg transition-colors hover:border-fg disabled:opacity-60"
            >
              Cancelar
            </button>
          </div>
        ) : (
          <div className="flex flex-wrap items-center gap-3">
            {step === "done" ? (
              <span role="status" className="font-semibold">
                ✅ Listo: volvieron los datos de prueba.
              </span>
            ) : null}
            <button
              type="button"
              onClick={() => setStep("confirm")}
              className="min-h-10 rounded-[10px] border border-mint bg-transparent px-3.5 font-semibold text-fg transition-colors hover:bg-mint hover:text-night"
            >
              Restablecer datos de prueba
            </button>
          </div>
        )}
      </div>

      {error ? (
        <div className={`${ADMIN_CONTAINER} pb-2.5`}>
          <ErrorBox message={error} />
        </div>
      ) : null}
    </div>
  );
}
