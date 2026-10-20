"use client";

import type { PaddingOptions } from "maplibre-gl";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState, type ReactNode, type RefObject } from "react";
import { SeverityBadge } from "@/components/admin/ui/SeverityBadge";
import { StatusBadge } from "@/components/admin/ui/StatusBadge";
import { MapView, type GeoPoint, type MapApi, type MapStatus } from "@/components/map/MapView";
import { REPORT_STATUS, SEVERITY } from "@/lib/admin/labels";
import { PORTALS } from "@/lib/data/portals";
import { attributionShort } from "@/lib/map/config";
import type { Portal } from "@/types/portal";
import type { ReportResponse, SeverityLevel } from "@/types/admin/report";
import { EmptyState } from "./EmptyState";
import { formatCaptureDate, reportCount } from "./format";
import { detailHref } from "./query";

type MapPoint = (GeoPoint & { kind: "portal"; portal: Portal }) | (GeoPoint & { kind: "report"; report: ReportResponse });

// The 8 portals, as a discreet reference under the reports
const PORTAL_POINTS: MapPoint[] = PORTALS.map((portal) => ({ id: `portal:${portal.id}`, lat: portal.lat, lng: portal.lng, kind: "portal", portal }));

/** Legend order: most severe first */
const LEVELS = (Object.keys(SEVERITY) as SeverityLevel[]).sort((a, b) => SEVERITY[b].rank - SEVERITY[a].rank);

/** Category severity, or the lowest one for a report whose category is missing */
const severityOf = (level: SeverityLevel) => SEVERITY[level] ?? SEVERITY.Low;

/** Width of the report card from 700 px (tab:w-[320px] in ReportCard) */
const CARD_WIDTH = 320;
const PANEL = "border border-rule bg-page/90 text-fg backdrop-blur-[12px]";

type Props = {
  /** Reports to place; null until the first answer */
  reports: ReportResponse[] | null;
  loading: boolean;
  /** Changes with the filters: the map frames everything again */
  framingKey: string;
  /** Current list query string, carried to the detail so it can come back to the same filters and view */
  query: string;
  filtered: boolean;
  onClear: () => void;
};

/**
 * "Mapa" view: the same reports as the list, placed on the satellite map (components/map/MapView).
 * Severity sets the marker's color and its stacking; pending reports are filled dots, the closed ones hollow rings.
 * A marker opens a card with the report and its "Ver detalle".
 */
export function ReportsMap({ reports, loading, framingKey, query, filtered, onClear }: Props) {
  const api = useRef<MapApi>(null);
  const wrapper = useRef<HTMLDivElement>(null);
  const card = useRef<HTMLElement>(null);
  /** Read by `padding` when MapView asks for it, so flying to a report leaves it clear of the card */
  const cardOpen = useRef(false);
  /** A marker picked with the keyboard moves the focus into its card */
  const focusCard = useRef(false);
  const framedKey = useRef<string | null>(null);
  const [status, setStatus] = useState<MapStatus>("loading");
  const [attempt, setAttempt] = useState(0);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const ready = status === "ready";

  // A report the filters leave out hides its card (it comes back with the report)
  const selected = reports?.find((r) => r.id === selectedId) ?? null;
  useEffect(() => {
    cardOpen.current = !!selected;
  });

  const points = useMemo<MapPoint[]>(
    () => [...PORTAL_POINTS, ...(reports ?? []).map((report): MapPoint => ({ id: report.id, lat: report.latitude, lng: report.longitude, kind: "report", report }))],
    [reports],
  );

  // New filters: frame the whole park again. The map is created framed, so its first answer needs nothing.
  useEffect(() => {
    if (!ready) return;
    if (framedKey.current !== null && framedKey.current !== framingKey) api.current?.fitAll();
    framedKey.current = framingKey;
  }, [ready, framingKey]);

  useEffect(() => {
    if (!selectedId || !focusCard.current) return;
    focusCard.current = false;
    card.current?.focus();
  }, [selectedId]);

  const padding = (el: HTMLElement): PaddingOptions => {
    const w = el.clientWidth;
    const h = el.clientHeight;
    const base = { top: Math.min(72, h * 0.12), bottom: Math.min(72, h * 0.12), left: Math.min(64, w * 0.08), right: Math.min(88, w * 0.12) };
    if (!cardOpen.current) return base;
    // The card sits on the left from 700 px, and at the bottom on phones
    return w >= 700 ? { ...base, left: CARD_WIDTH + 36 } : { ...base, bottom: h * 0.5 };
  };

  /** Closes the card and gives the focus back to its marker */
  const close = () => {
    const id = selectedId;
    cardOpen.current = false;
    setSelectedId(null);
    if (id) wrapper.current?.querySelector<HTMLElement>(`[data-testid="map-marker"][data-report-id="${CSS.escape(id)}"]`)?.focus();
  };

  const select = (report: ReportResponse, fromKeyboard: boolean) => {
    if (report.id === selectedId) return close();
    focusCard.current = fromKeyboard;
    cardOpen.current = true;
    setSelectedId(report.id);
    // Reports around a portal overlap at the park's zoom: get closer so the neighbours come apart
    api.current?.flyTo({ lat: report.latitude, lng: report.longitude }, { zoomOffset: 2 });
  };

  const showAll = () => api.current?.fitAll();

  return (
    <div
      ref={wrapper}
      onKeyDown={(e) => {
        if (e.key === "Escape" && selectedId) {
          e.stopPropagation();
          close();
        }
      }}
      className="relative h-[min(72svh,760px)] min-h-[460px] overflow-hidden rounded-[12px] border border-rule bg-night"
    >
      <div className="absolute inset-0 transition-opacity duration-700" style={{ opacity: ready ? 1 : 0 }}>
        <MapView
          label="Mapa satelital del Iberá con los reportes"
          layerClassName="z-[2]"
          points={points}
          padding={padding}
          attempt={attempt}
          api={api}
          onStatusChange={setStatus}
          pointZ={(p) => {
            if (p.kind === "portal") return 1;
            if (p.report.id === selectedId) return 100;
            // Most severe on top; within a severity, pending over closed
            return 10 + severityOf(p.report.severityLevel).rank * 2 + (p.report.status === "Pending" ? 1 : 0);
          }}
          renderPoint={(p) =>
            p.kind === "portal" ? (
              <PortalMark portal={p.portal} />
            ) : (
              <ReportMarker report={p.report} selected={p.report.id === selectedId} focusable={ready} onSelect={(fromKeyboard) => select(p.report, fromKeyboard)} />
            )
          }
        />
      </div>

      <p
        role="status"
        data-testid="map-count"
        data-count={reports?.length ?? ""}
        className={`absolute left-3 top-3 z-[4] m-0 rounded-full px-3.5 py-2 text-[14px] font-semibold ${PANEL}`}
      >
        {reports ? `${reportCount(reports.length)} en el mapa` : "Cargando reportes…"}
        {loading && reports ? <span className="font-medium text-mute"> · Actualizando…</span> : null}
      </p>

      {ready ? (
        <div className={`absolute right-3 top-3 z-[4] flex flex-col overflow-hidden rounded-[12px] ${PANEL}`}>
          <MapControl label="Acercar" onClick={() => api.current?.zoomBy(1)}>
            <path d="M12 5v14M5 12h14" />
          </MapControl>
          <MapControl label="Alejar" onClick={() => api.current?.zoomBy(-1)} divided>
            <path d="M5 12h14" />
          </MapControl>
          <MapControl label="Ver todos los reportes" onClick={showAll} divided>
            <circle cx="12" cy="12" r="6" />
            <path d="M12 2v4M12 18v4M2 12h4M18 12h4" />
          </MapControl>
        </div>
      ) : null}

      <Legend />

      {status === "loading" ? (
        <div className="pointer-events-none absolute inset-0 z-[3] flex items-center justify-center">
          <span className="eyebrow flex items-center gap-2.5 text-sage">
            <span className="size-1.5 animate-ib-breathe rounded-full bg-mint" />
            Cargando mapa…
          </span>
        </div>
      ) : null}

      {status === "error" ? (
        <div className="absolute inset-0 z-[5] flex items-center justify-center p-6">
          <div role="alert" className="flex max-w-[360px] flex-col gap-4 rounded-[12px] border border-rule bg-page-2 p-6 text-fg">
            <p className="m-0 text-[17px] font-semibold leading-snug text-head">No pudimos cargar el mapa.</p>
            <p className="m-0 text-[15px] leading-snug text-mute">Revisá tu conexión y probá de nuevo. Mientras tanto, los reportes siguen en la pestaña Lista.</p>
            <button
              type="button"
              onClick={() => {
                setStatus("loading");
                setAttempt((a) => a + 1);
              }}
              className="min-h-12 self-start rounded-[10px] bg-mint px-5 text-[16px] font-semibold text-night transition-colors hover:bg-leaf"
            >
              Reintentar
            </button>
          </div>
        </div>
      ) : null}

      {reports && reports.length === 0 && !loading && status !== "error" ? (
        <div className="pointer-events-none absolute inset-0 z-[5] flex items-center justify-center p-4">
          <EmptyState filtered={filtered} onClear={onClear} className="pointer-events-auto max-w-[420px] rounded-[12px] border border-rule bg-page-2 py-8" />
        </div>
      ) : null}

      {selected && status !== "error" ? <ReportCard report={selected} query={query} cardRef={card} onClose={close} /> : null}
    </div>
  );
}

type MarkerProps = {
  report: ReportResponse;
  selected: boolean;
  /** Markers are only reachable with Tab once the map placed them */
  focusable: boolean;
  onSelect: (fromKeyboard: boolean) => void;
};

function ReportMarker({ report, selected, focusable, onSelect }: MarkerProps) {
  const { color } = severityOf(report.severityLevel);
  const pending = report.status === "Pending";
  return (
    <button
      type="button"
      data-testid="map-marker"
      data-report-id={report.id}
      aria-label={`${report.category || "Sin categoría"}, ${REPORT_STATUS[report.status].label}, ${formatCaptureDate(report.captureDate)}`}
      aria-pressed={selected}
      tabIndex={focusable ? 0 : -1}
      // detail is 0 when Enter or Space "clicked" the button
      onClick={(e) => onSelect(e.detail === 0)}
      className="group pointer-events-auto absolute -left-4 -top-4 flex size-8 items-center justify-center rounded-full border-none bg-transparent p-0"
    >
      {selected ? <span aria-hidden="true" className="absolute inset-0 rounded-full border-2 border-white shadow-[0_0_0_3px_rgba(0,0,0,.35)]" /> : null}
      <span
        aria-hidden="true"
        className="block rounded-full transition-transform duration-300 group-hover:scale-125"
        style={
          pending
            ? { width: 16, height: 16, background: color, border: "2px solid #FFFFFF", boxShadow: "0 0 8px rgba(0,0,0,.6)" }
            : { width: 14, height: 14, background: "rgba(11,16,14,.6)", border: `3px solid ${color}`, opacity: 0.8, boxShadow: "0 0 6px rgba(0,0,0,.5)" }
        }
      />
    </button>
  );
}

function PortalMark({ portal }: { portal: Portal }) {
  return (
    <span aria-hidden="true" className="pointer-events-none absolute left-0 top-0">
      <span className="absolute -left-[5px] -top-[5px] size-[10px] rounded-full border border-white/70 bg-white/15" />
      <span className="absolute left-[18px] top-[-6px] whitespace-nowrap text-[11px] font-medium leading-none text-white/75 [text-shadow:0_1px_6px_rgba(0,0,0,.95)]">
        {portal.name}
      </span>
    </span>
  );
}

type CardProps = {
  report: ReportResponse;
  query: string;
  cardRef: RefObject<HTMLElement | null>;
  onClose: () => void;
};

/** The picked report: on the left from 700 px, at the bottom on phones. */
function ReportCard({ report, query, cardRef, onClose }: CardProps) {
  const category = report.category || "Sin categoría";
  return (
    <section
      ref={cardRef}
      tabIndex={-1}
      aria-label={`Reporte de ${category}`}
      data-testid="map-card"
      data-report-id={report.id}
      className="absolute inset-x-3 bottom-3 z-[6] flex max-h-[min(55%,420px)] flex-col gap-3 overflow-y-auto rounded-[12px] border border-rule bg-page-2 p-4 text-fg shadow-[0_12px_40px_rgba(0,0,0,.45)] tab:inset-x-auto tab:bottom-auto tab:left-3 tab:top-16 tab:max-h-[calc(100%-5rem)] tab:w-[320px]"
    >
      <div className="flex items-start justify-between gap-3">
        <h2 className="m-0 text-[18px] font-semibold leading-tight text-head">{category}</h2>
        <button
          type="button"
          onClick={onClose}
          aria-label="Cerrar"
          className="-m-1 flex size-9 shrink-0 items-center justify-center rounded-full border border-rule bg-transparent text-[20px] leading-none text-fg transition-colors hover:border-fg"
        >
          <span aria-hidden="true">×</span>
        </button>
      </div>

      <div className="flex gap-3 tab:flex-col">
        {report.photoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element -- synced photos are blob: URLs in demo mode, next/image does not apply
          <img
            src={report.photoUrl}
            alt={`Foto del reporte de ${category}`}
            decoding="async"
            className="size-16 shrink-0 rounded-[8px] bg-page object-cover tab:aspect-[16/10] tab:h-auto tab:w-full"
          />
        ) : (
          <span className="flex size-16 shrink-0 items-center justify-center rounded-[8px] border border-dashed border-rule text-center text-[11px] font-medium text-mute tab:aspect-[16/10] tab:h-auto tab:w-full">
            Sin foto
          </span>
        )}
        <div className="flex min-w-0 flex-col gap-2.5">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
            <StatusBadge status={report.status} />
            {SEVERITY[report.severityLevel] ? <SeverityBadge level={report.severityLevel} /> : null}
          </div>
          <dl className="m-0 grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-[14px]">
            <dt className="text-mute">Captura</dt>
            <dd className="m-0 [font-variant-numeric:tabular-nums]">
              <time dateTime={report.captureDate}>{formatCaptureDate(report.captureDate)}</time>
            </dd>
            <dt className="text-mute">Reportado por</dt>
            <dd className="m-0">{report.reportedBy || "—"}</dd>
          </dl>
        </div>
      </div>

      {report.notes ? <p className="m-0 line-clamp-3 text-[14px] text-mute">{report.notes}</p> : null}

      <Link
        href={detailHref(report.id, query)}
        data-testid="map-detail-link"
        className="flex min-h-11 items-center justify-center gap-2 rounded-[10px] bg-mint px-4 text-[16px] font-semibold text-night no-underline transition-colors hover:bg-leaf hover:text-night"
      >
        Ver detalle <span aria-hidden="true">→</span>
      </Link>
    </section>
  );
}

function Legend() {
  return (
    <div className={`pointer-events-none absolute bottom-3 right-3 z-[3] flex max-w-[min(280px,calc(100%-1.5rem))] flex-col gap-2 rounded-[10px] px-3 py-2.5 text-[12px] font-medium leading-none ${PANEL}`}>
      <p className="eyebrow m-0 text-[11px] text-mute">Gravedad</p>
      <ul className="m-0 flex list-none flex-wrap gap-x-3 gap-y-1.5 p-0">
        {LEVELS.map((level) => (
          <li key={level} className="flex items-center gap-1.5">
            <span aria-hidden="true" className="size-2.5 rounded-full" style={{ background: SEVERITY[level].color }} />
            {SEVERITY[level].label}
          </li>
        ))}
      </ul>
      <ul className="m-0 flex list-none flex-wrap gap-x-3 gap-y-1.5 border-t border-rule p-0 pt-2">
        <LegendItem mark={<span className="size-3 rounded-full border-2 border-white bg-sage shadow-[0_0_0_1px_var(--rule)]" />}>Pendiente</LegendItem>
        <LegendItem mark={<span className="size-3 rounded-full border-[3px] border-sage bg-transparent" />}>Resuelto o cancelado</LegendItem>
      </ul>
      <span className="text-[10px] text-mute">{attributionShort()}</span>
    </div>
  );
}

function LegendItem({ mark, children }: { mark: ReactNode; children: ReactNode }) {
  return (
    <li className="flex items-center gap-1.5">
      <span aria-hidden="true" className="flex">
        {mark}
      </span>
      {children}
    </li>
  );
}

function MapControl({ label, onClick, divided = false, children }: { label: string; onClick: () => void; divided?: boolean; children: ReactNode }) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      className={`flex size-11 items-center justify-center border-0 bg-transparent p-0 text-fg transition-colors hover:bg-page-2 ${divided ? "border-t border-solid border-rule" : ""}`}
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
        {children}
      </svg>
    </button>
  );
}
