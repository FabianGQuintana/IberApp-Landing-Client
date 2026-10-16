"use client";

import { useState } from "react";
import { BigButton } from "@/components/rangers/ui/BigButton";
import { DEMO_MODE } from "@/lib/rangers/demo";
import { RangerHeader } from "@/components/rangers/ui/RangerHeader";
import { OfflineBanner } from "@/components/rangers/ui/OfflineBanner";
import type { UserProfile } from "@/types/rangers/auth";

type Props = {
  user: UserProfile;
  /** null while the phone's database is being read */
  pendingCount: number | null;
  onNewReport: () => void;
  onSync: () => void;
  onLogout: () => void;
};

/**
 * Vista 1 — Pantalla principal. Two giant buttons and nothing else competing for attention.
 * "Salir" is at the bottom, smaller and neutral, so it is not pressed by accident.
 */
export function DashboardView({ user, pendingCount, onNewReport, onSync, onLogout }: Props) {
  const [confirmLogout, setConfirmLogout] = useState(false);

  const syncLabel =
    pendingCount === null
      ? "Sincronizar"
      : pendingCount === 0
        ? "Sincronizar (nada pendiente)"
        : `Sincronizar (${pendingCount} ${pendingCount === 1 ? "pendiente" : "pendientes"})`;

  return (
    <div className="mx-auto flex min-h-svh w-full max-w-xl flex-col bg-page text-fg">
      <RangerHeader />
      <OfflineBanner />

      <main className="flex flex-1 flex-col gap-4 px-5 pb-8 pt-6" style={{ paddingBottom: "max(2rem, env(safe-area-inset-bottom))" }}>
        <div className="mb-2 flex flex-col gap-2">
          <span className="eyebrow text-mute">Recorrido de hoy</span>
          <h1 className="title-display m-0 text-[clamp(36px,10vw,52px)] leading-[0.95] text-head">Hola, {user.name}</h1>
        </div>

        {DEMO_MODE ? (
          <p className="m-0 rounded-[10px] border border-mint/60 bg-mint/10 px-4 py-3 text-[14px] text-fg">
            🧪 <strong>Modo demostración.</strong> Los reportes se guardan en este navegador y &quot;Sincronizar&quot; simula el envío. Probá también
            sin conexión (DevTools → Network → Offline).
          </p>
        ) : null}
        <BigButton size="hero" icon="📸" onClick={onNewReport}>
          Nuevo reporte
        </BigButton>

        <BigButton
          size="hero"
          variant="sync"
          icon="🔄"
          onClick={onSync}
          aria-label={pendingCount ? `${syncLabel}. Tenés reportes guardados en el teléfono sin enviar.` : syncLabel}
        >
          {syncLabel}
        </BigButton>

        <div className="mt-auto pt-4">
          {confirmLogout ? (
            <div role="alertdialog" aria-labelledby="logout-question" className="flex flex-col gap-3 rounded-[12px] border border-[#e5484d] p-4">
              <p id="logout-question" className="text-[17px] font-semibold">
                {pendingCount
                  ? `¿Salir? Los ${pendingCount} reportes sin enviar quedan guardados en este teléfono.`
                  : "¿Seguro que querés salir?"}
              </p>
              <BigButton variant="danger" icon="🚪" onClick={onLogout}>
                Sí, salir
              </BigButton>
              <BigButton variant="neutral" onClick={() => setConfirmLogout(false)}>
                No, quedarme
              </BigButton>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setConfirmLogout(true)}
              className="min-h-14 w-full rounded-[12px] border border-rule px-4 text-[15px] font-semibold text-mute transition-colors hover:border-fg hover:text-fg"
            >
              <span aria-hidden="true">🚪 </span>Salir de mi usuario
            </button>
          )}
        </div>
      </main>
    </div>
  );
}
