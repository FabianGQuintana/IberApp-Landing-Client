"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { PageHeader } from "@/components/admin/ui/PageHeader";
import { SeverityBadge } from "@/components/admin/ui/SeverityBadge";
import { ErrorBox } from "@/components/rangers/ui/ErrorBox";
import { Spinner } from "@/components/rangers/ui/Spinner";
import { SEVERITY } from "@/lib/admin/labels";
import { ApiError } from "@/lib/api/client";
import { getReport } from "@/services/admin/reports";
import type { ReportResponse } from "@/types/admin/report";
import { errorMessage, formatDateTime, listHref } from "./format";
import { LocationPanel } from "./LocationPanel";
import { BUTTON, Field, Panel } from "./Panel";
import { ReportPhoto } from "./ReportPhoto";
import { StatusPanel } from "./StatusPanel";

type State =
  | { kind: "loading" }
  | { kind: "ready"; report: ReportResponse }
  | { kind: "missing"; message: string }
  | { kind: "error"; message: string };

function failed(err: unknown): State {
  if (err instanceof ApiError && err.status === 404) return { kind: "missing", message: err.message };
  return { kind: "error", message: errorMessage(err, "No pudimos cargar el reporte. Probá de nuevo.") };
}

type Props = {
  id: string;
  /** Query string of the list the admin came from */
  back?: string;
};

/** /admin/reportes/[id]: everything about one report, and where the admin resolves or cancels it. */
export function ReportDetail({ id, back }: Props) {
  const [state, setState] = useState<State>({ kind: "loading" });
  const [attempt, setAttempt] = useState(0);
  const href = listHref(back);

  useEffect(() => {
    let cancelled = false;
    getReport(id).then(
      (report) => !cancelled && setState({ kind: "ready", report }),
      (err: unknown) => !cancelled && setState(failed(err)),
    );
    return () => {
      cancelled = true;
    };
  }, [id, attempt]);

  const retry = () => {
    setState({ kind: "loading" });
    setAttempt((n) => n + 1);
  };

  return (
    <>
      <Link href={href} data-testid="back-to-list" className="self-start text-[15px] font-medium text-mute no-underline transition-colors hover:text-fg">
        ← Volver a reportes
      </Link>

      {state.kind === "loading" ? <Spinner label="Cargando el reporte…" /> : null}

      {state.kind === "missing" ? (
        <>
          <PageHeader title="Reporte no encontrado" description={state.message} />
          <Link href={href} className={`${BUTTON.base} ${BUTTON.primary} self-start`}>
            Ver la lista de reportes
          </Link>
        </>
      ) : null}

      {state.kind === "error" ? (
        <div className="flex max-w-[560px] flex-col items-start gap-4">
          <ErrorBox message={state.message} />
          <button type="button" onClick={retry} className={`${BUTTON.base} ${BUTTON.neutral}`}>
            Probá de nuevo
          </button>
        </div>
      ) : null}

      {state.kind === "ready" ? <Report report={state.report} onChange={(report) => setState({ kind: "ready", report })} /> : null}
    </>
  );
}

function Report({ report, onChange }: { report: ReportResponse; onChange: (report: ReportResponse) => void }) {
  // The backend sends "" when the category or the user no longer exist
  const category = report.category || "Sin categoría";
  const hasSeverity = report.severityLevel in SEVERITY;

  return (
    <>
      <PageHeader
        title={category}
        description={
          <span className="flex flex-wrap items-center gap-x-3 gap-y-1">
            {hasSeverity ? <SeverityBadge level={report.severityLevel} /> : null}
            <span>Capturado el {formatDateTime(report.captureDate)}</span>
          </span>
        }
      />

      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1.6fr)_minmax(340px,1fr)]">
        <div className="flex flex-col gap-6">
          <ReportPhoto photoUrl={report.photoUrl} alt={`Foto del reporte: ${category}`} caption={report.notes ?? category} />

          <Panel title="Nota del guardaparque">
            {report.notes ? (
              <p className="m-0 whitespace-pre-line text-[17px] leading-relaxed text-fg">{report.notes}</p>
            ) : (
              <p className="m-0 text-[16px] text-mute">El guardaparque no dejó una nota.</p>
            )}
          </Panel>

          <Panel title="Datos del reporte">
            <dl className="m-0 grid gap-4 sm:grid-cols-3">
              <Field label="Reportado por">{report.reportedBy || "Usuario desconocido"}</Field>
              <Field label="Capturado">{formatDateTime(report.captureDate)}</Field>
              <Field label="Sincronizado">{report.syncDate ? formatDateTime(report.syncDate) : "Sin sincronizar"}</Field>
            </dl>
            <details className="text-[14px]">
              <summary className="cursor-pointer font-medium text-mute transition-colors hover:text-fg">Datos técnicos</summary>
              <dl className="m-0 mt-3 grid gap-3 sm:grid-cols-2">
                <Field label="ID del reporte">
                  <Id value={report.id} />
                </Field>
                <Field label="ID en el celular">
                  <Id value={report.clientId} />
                </Field>
                <Field label="ID de la categoría">
                  <Id value={report.reportCategoryId} />
                </Field>
                <Field label="ID del guardaparque">
                  <Id value={report.reportedById} />
                </Field>
              </dl>
            </details>
          </Panel>
        </div>

        <div className="flex flex-col gap-6">
          <StatusPanel report={report} onChange={onChange} />
          <LocationPanel latitude={report.latitude} longitude={report.longitude} />
        </div>
      </div>
    </>
  );
}

function Id({ value }: { value: string | null }) {
  return value ? <span className="break-all font-mono text-[13px]">{value}</span> : <span className="text-mute">—</span>;
}
