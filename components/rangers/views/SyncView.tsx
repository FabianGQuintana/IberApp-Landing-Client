"use client";

import { useState } from "react";
import { BigButton } from "@/components/rangers/ui/BigButton";
import { ErrorBox } from "@/components/rangers/ui/ErrorBox";
import { Screen } from "@/components/rangers/ui/Screen";
import { Spinner } from "@/components/rangers/ui/Spinner";
import { SuccessOverlay } from "@/components/rangers/ui/SuccessOverlay";
import { LoginView } from "@/components/rangers/views/LoginView";
import { usePendingReports } from "@/hooks/rangers/usePendingReports";
import { useSession } from "@/hooks/rangers/useSession";
import { ApiError, OfflineError } from "@/lib/api/client";
import { getCategory } from "@/lib/rangers/categories";
import { deleteReport } from "@/lib/rangers/reports-db";
import { DEMO_MODE } from "@/lib/rangers/demo";
import { hasLocation, syncReports, type SyncProgress, type SyncSummary } from "@/services/rangers/reports";
import type { PendingReport } from "@/types/rangers/report";

type Props = { onDone: () => void };

/**
 * Vista 3 — Bandeja de sincronización: lo que está guardado en el teléfono y un solo botón para enviarlo todo.
 */
export function SyncView({ onDone }: Props) {
  const { reports } = usePendingReports();
  const { session, tokenValid } = useSession();
  const [progress, setProgress] = useState<SyncProgress | null>(null);
  const [summary, setSummary] = useState<SyncSummary | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [needsLogin, setNeedsLogin] = useState(false);

  const sendable = reports?.filter((r) => hasLocation(r) || r.serverId).length ?? 0;

  const sendAll = async () => {
    if (!reports?.length) return;
    if (!tokenValid) {
      setNeedsLogin(true);
      return;
    }
    setError(null);
    setProgress({ step: "data", done: 0, total: reports.length });
    try {
      setSummary(await syncReports(reports, setProgress));
    } catch (err) {
      if (err instanceof OfflineError) setError("No hay señal o el servidor no responde. Tus reportes siguen guardados: probá de nuevo cuando tengas señal.");
      else if (err instanceof ApiError && err.status === 401) setNeedsLogin(true);
      else if (err instanceof ApiError) setError(err.message);
      else setError("Algo falló al enviar. Tus reportes siguen guardados en el teléfono.");
    } finally {
      setProgress(null);
    }
  };

  // Session expired: log in again right here, without losing anything, and come back to this screen
  if (needsLogin && !tokenValid && session) {
    return (
      <LoginView
        reason="Tu sesión venció. Entrá de nuevo para enviar. Tus reportes siguen guardados en el teléfono."
        defaultEmail={session.user.email}
        onCancel={() => setNeedsLogin(false)}
      />
    );
  }

  if (summary) {
    const leftovers = summary.photosPending + summary.withoutLocation;
    return (
      <SuccessOverlay
        title={summary.sent === 1 ? "¡1 reporte enviado!" : `¡${summary.sent} reportes enviados!`}
        message={
          leftovers
            ? `Quedan ${leftovers} en el teléfono (${[
                summary.photosPending ? `${summary.photosPending} con la foto sin enviar` : "",
                summary.withoutLocation ? `${summary.withoutLocation} sin ubicación GPS` : "",
              ]
                .filter(Boolean)
                .join(", ")}).`
            : DEMO_MODE
              ? "Modo demostración: los reportes llegaron al servidor de prueba. Entrá al panel (/admin) como administrador para verlos."
              : "Todo llegó al servidor. Ya no queda nada pendiente."
        }
        buttonLabel="Volver al inicio"
        onClose={onDone}
      />
    );
  }

  const busy = progress !== null;

  return (
    <Screen
      title="Sincronizar"
      onBack={busy ? undefined : onDone}
      footer={
        busy ? (
          <Spinner label={progressLabel(progress)} />
        ) : (
          <BigButton icon="🚀" variant="sync" onClick={sendAll} disabled={!sendable}>
            Enviar todo al servidor
          </BigButton>
        )
      }
    >
      {reports === null ? (
        <Spinner label="Leyendo los reportes guardados…" />
      ) : reports.length === 0 ? (
        <div className="flex flex-col items-center gap-4 py-10 text-center">
          <span aria-hidden="true" className="text-[3.5rem] leading-none">
            ✅
          </span>
          <p className="text-[20px] font-semibold">No hay reportes pendientes.</p>
          <p className="text-[17px] text-mute">Todo lo que guardaste ya está en el servidor.</p>
        </div>
      ) : (
        <>
          <p className="text-[17px] font-semibold">
            {reports.length === 1 ? "1 reporte guardado en el teléfono:" : `${reports.length} reportes guardados en el teléfono:`}
          </p>
          <ul className="flex flex-col gap-3">
            {reports.map((r) => (
              <ReportRow key={r.clientId} report={r} disabled={busy} />
            ))}
          </ul>
        </>
      )}

      <ErrorBox message={error} />
    </Screen>
  );
}

function ReportRow({ report, disabled }: { report: PendingReport; disabled: boolean }) {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const category = getCategory(report.categoryId);
  const noLocation = !hasLocation(report) && !report.serverId;

  return (
    <li className={`flex flex-col gap-2 rounded-[12px] border bg-page-2 p-4 ${noLocation ? "border-orange" : "border-rule"}`}>
      <p className="flex items-center gap-3 text-[17px] font-semibold">
        <span aria-hidden="true" className="text-[clamp(30px,8vw,40px)] leading-none">
          {category?.icon ?? "📍"}
        </span>
        <span>
          Reporte: {category?.label ?? "Otro"} – {formatTime(report.captureDate)}
        </span>
      </p>

      <p className="flex flex-wrap gap-x-4 gap-y-1 text-[15px] text-mute">
        {report.photo ? <span>📷 Con foto</span> : <span>Sin foto</span>}
        {report.serverId ? <span className="font-semibold text-sky">Falta enviar la foto</span> : null}
        {noLocation ? <span className="font-semibold text-orange">⚠️ Sin ubicación GPS: no se puede enviar</span> : null}
      </p>

      {noLocation ? (
        confirmDelete ? (
          <div className="flex flex-col gap-2">
            <BigButton variant="danger" icon="🗑️" disabled={disabled} onClick={() => deleteReport(report.clientId)}>
              Sí, borrar
            </BigButton>
            <BigButton variant="neutral" onClick={() => setConfirmDelete(false)}>
              No borrar
            </BigButton>
          </div>
        ) : (
          <button
            type="button"
            disabled={disabled}
            onClick={() => setConfirmDelete(true)}
            className="min-h-14 self-start rounded-[10px] border border-[#e5484d] px-4 text-[15px] font-semibold text-[#ff6b6b] active:bg-[#e5484d]/10"
          >
            Borrar este reporte
          </button>
        )
      ) : null}
    </li>
  );
}

function progressLabel(progress: SyncProgress | null) {
  if (!progress || progress.total === 0) return "Enviando…";
  const current = Math.min(progress.done + 1, progress.total);
  return progress.step === "data"
    ? `Enviando reportes… (${current} de ${progress.total})`
    : `Enviando fotos… (${current} de ${progress.total})`;
}

/** "15:30 hs" for today, "14/10 15:30 hs" for other days */
function formatTime(iso: string) {
  const date = new Date(iso);
  const time = date.toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit", hour12: false });
  const isToday = date.toDateString() === new Date().toDateString();
  return isToday ? `${time} hs` : `${date.toLocaleDateString("es-AR", { day: "2-digit", month: "2-digit" })} ${time} hs`;
}
