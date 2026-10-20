"use client";

import { useEffect, useRef, useState } from "react";
import { StatusBadge } from "@/components/admin/ui/StatusBadge";
import { ErrorBox } from "@/components/rangers/ui/ErrorBox";
import { REPORT_STATUS } from "@/lib/admin/labels";
import { updateReportStatus } from "@/services/admin/reports";
import type { ReportResponse, ReportStatus } from "@/types/admin/report";
import { errorMessage } from "./format";
import { BUTTON, Panel } from "./Panel";

type Action = { to: ReportStatus; label: string; question: string; confirm: string; primary?: boolean };

const BACK_TO_PENDING: Action = { to: "Pending", label: "Volver a pendiente", question: "¿Volver el reporte a pendiente?", confirm: "Sí, volver a pendiente" };

// What the admin can do from each status. The backend accepts any transition (ReportService.UpdateStatusAsync).
const ACTIONS: Record<ReportStatus, Action[]> = {
  Pending: [
    { to: "Done", label: "Marcar como resuelto", question: "¿Marcar el reporte como resuelto?", confirm: "Sí, marcar como resuelto", primary: true },
    { to: "Canceled", label: "Cancelar reporte", question: "¿Cancelar el reporte?", confirm: "Sí, cancelar el reporte" },
  ],
  Done: [BACK_TO_PENDING],
  Canceled: [BACK_TO_PENDING],
};

type Props = {
  report: ReportResponse;
  /** The report as the server returned it after the change */
  onChange: (report: ReportResponse) => void;
};

/** Current status and its actions. Each change asks first, naming the new status, and only shows once the server saved it. */
export function StatusPanel({ report, onChange }: Props) {
  const [pending, setPending] = useState<Action | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState<ReportStatus | null>(null);
  const [error, setError] = useState<string | null>(null);
  const question = useRef<HTMLDivElement>(null);

  // Keyboard and screen reader users land on the question, not on the button that confirms it
  useEffect(() => {
    if (pending) question.current?.focus();
  }, [pending]);

  const ask = (action: Action) => {
    setPending(action);
    setSaved(null);
    setError(null);
  };

  const confirm = async () => {
    if (!pending) return;
    setSaving(true);
    setError(null);
    try {
      const updated = await updateReportStatus(report.id, pending.to);
      onChange(updated);
      setSaved(updated.status);
      setPending(null);
    } catch (err) {
      // The status stays as it was; the question stays open to try again
      setError(errorMessage(err, "No pudimos cambiar el estado. Probá de nuevo."));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Panel title="Estado">
      <span data-testid="detail-status" className="self-start">
        <StatusBadge status={report.status} />
      </span>

      {pending ? (
        <div ref={question} role="alertdialog" aria-labelledby="status-question" aria-describedby="status-change" tabIndex={-1} className="flex flex-col gap-3 rounded-[10px] border border-rule p-4 outline-none focus-visible:border-fg">
          <p id="status-question" className="m-0 text-[16px] font-semibold text-head">
            {pending.question}
          </p>
          <p id="status-change" className="m-0 text-[15px] text-fg">
            Pasa de <strong>{REPORT_STATUS[report.status].label}</strong> a <strong>{REPORT_STATUS[pending.to].label}</strong>.
          </p>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              data-testid="confirm-status"
              onClick={confirm}
              disabled={saving}
              aria-busy={saving}
              className={`${BUTTON.base} ${BUTTON.primary}`}
            >
              {saving ? "Guardando…" : pending.confirm}
            </button>
            <button type="button" onClick={() => setPending(null)} disabled={saving} className={`${BUTTON.base} ${BUTTON.neutral}`}>
              No, dejarlo así
            </button>
          </div>
        </div>
      ) : (
        <div className="flex flex-wrap gap-2">
          {ACTIONS[report.status].map((action) => (
            <button
              key={action.to}
              type="button"
              data-testid={`action-${action.to}`}
              onClick={() => ask(action)}
              className={`${BUTTON.base} ${action.primary ? BUTTON.primary : BUTTON.neutral}`}
            >
              {action.label}
            </button>
          ))}
        </div>
      )}

      <ErrorBox message={error} />
      {saved ? (
        <p role="status" className="m-0 text-[15px] font-semibold text-fg">
          ✅ Listo: el reporte quedó como {REPORT_STATUS[saved].label}.
        </p>
      ) : null}
    </Panel>
  );
}
