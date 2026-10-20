import type { ReactNode } from "react";
import { REPORT_STATUS, SEVERITY } from "@/lib/admin/labels";
import type { ReportCategory, ReportFilter, ReportStatus, StaffMember } from "@/types/admin/report";
import { hasFilters } from "./query";

const STATUSES: ReportStatus[] = ["Pending", "Done", "Canceled"];

const CONTROL =
  "h-12 w-full min-w-0 rounded-[10px] border border-rule bg-page px-3.5 text-[16px] text-fg outline-none transition-colors focus:border-mint disabled:cursor-not-allowed disabled:opacity-60";
const SELECT = `${CONTROL} cursor-pointer appearance-none bg-[url("data:image/svg+xml,%3Csvg%20xmlns='http://www.w3.org/2000/svg'%20width='20'%20height='20'%20viewBox='0%200%2024%2024'%20fill='none'%20stroke='%238FA89A'%20stroke-width='1.7'%3E%3Cpath%20d='M6%209l6%206%206-6'/%3E%3C/svg%3E")] bg-[length:20px] bg-[right_12px_center] bg-no-repeat pr-10`;
const OPTION = "bg-page-2 text-fg";

type Props = {
  filter: ReportFilter;
  /** null while loading (or when they could not be loaded: optionsFailed) */
  categories: ReportCategory[] | null;
  staff: StaffMember[] | null;
  optionsFailed: boolean;
  onChange: (filter: ReportFilter) => void;
  onClear: () => void;
};

/** The ReportFilterDTO fields: status, category, reporter and an inclusive capture date range. */
export function ReportFilters({ filter, categories, staff, optionsFailed, onChange, onClear }: Props) {
  const set = (patch: Partial<ReportFilter>) => onChange({ ...filter, ...patch });
  const placeholder = optionsFailed ? "No disponible" : "Cargando…";
  // A shared link can name a category or person this list does not have: keep it visible instead of showing "Todas"
  const unknownCategory = !!categories && !!filter.categoryId && !categories.some((c) => c.id === filter.categoryId);
  const unknownPerson = !!staff && !!filter.reportedById && !staff.some((s) => s.id === filter.reportedById);

  return (
    <section aria-labelledby="report-filters-title" className="flex flex-col gap-4 rounded-[12px] border border-rule bg-page-2 p-4 tab:p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 id="report-filters-title" className="eyebrow m-0 text-mute">
          Filtros
        </h2>
        <button
          type="button"
          data-testid="filter-clear"
          onClick={onClear}
          disabled={!hasFilters(filter)}
          className="min-h-10 rounded-[10px] border border-rule bg-transparent px-3.5 text-[15px] font-semibold text-fg transition-colors hover:border-fg disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:border-rule"
        >
          Limpiar filtros
        </button>
      </div>

      <div className="grid grid-cols-2 gap-x-3 gap-y-4 tab:grid-cols-6 xl:grid-cols-[minmax(0,.9fr)_minmax(0,1.5fr)_minmax(0,1.2fr)_minmax(0,1fr)_minmax(0,1fr)]">
        <Field label="Estado" htmlFor="filter-status" className="col-span-2 xl:col-span-1">
          <select
            id="filter-status"
            data-testid="filter-status"
            value={filter.status ?? ""}
            onChange={(e) => set({ status: STATUSES.find((s) => s === e.target.value) })}
            className={SELECT}
          >
            <option value="" className={OPTION}>
              Todos
            </option>
            {STATUSES.map((s) => (
              <option key={s} value={s} className={OPTION}>
                {REPORT_STATUS[s].label}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Categoría" htmlFor="filter-category" className="col-span-2 tab:col-span-4 xl:col-span-1">
          <select
            id="filter-category"
            data-testid="filter-category"
            value={filter.categoryId ?? ""}
            onChange={(e) => set({ categoryId: e.target.value || undefined })}
            disabled={!categories}
            className={SELECT}
          >
            <option value="" className={OPTION}>
              {categories ? "Todas" : placeholder}
            </option>
            {categories?.map((c) => (
              <option key={c.id} value={c.id} className={OPTION}>
                {/* Severity as text: options cannot hold the colored bars */}
                {c.name} · {SEVERITY[c.severityLevel]?.label ?? c.severityLevel}
              </option>
            ))}
            {unknownCategory ? (
              <option value={filter.categoryId} className={OPTION}>
                Categoría desconocida
              </option>
            ) : null}
          </select>
        </Field>

        <Field label="Reportado por" htmlFor="filter-staff" className="col-span-2 xl:col-span-1">
          <select
            id="filter-staff"
            data-testid="filter-staff"
            value={filter.reportedById ?? ""}
            onChange={(e) => set({ reportedById: e.target.value || undefined })}
            disabled={!staff}
            className={SELECT}
          >
            <option value="" className={OPTION}>
              {staff ? "Todas las personas" : placeholder}
            </option>
            {staff?.map((s) => (
              <option key={s.id} value={s.id} className={OPTION}>
                {s.lastName}, {s.name}
                {s.isActive ? "" : " (inactivo)"}
              </option>
            ))}
            {unknownPerson ? (
              <option value={filter.reportedById} className={OPTION}>
                Persona desconocida
              </option>
            ) : null}
          </select>
        </Field>

        <Field label="Desde" htmlFor="filter-from" className="col-span-1 tab:col-span-2 xl:col-span-1">
          <input
            id="filter-from"
            data-testid="filter-from"
            type="date"
            value={filter.from ?? ""}
            max={filter.to}
            onChange={(e) => set({ from: e.target.value || undefined })}
            className={CONTROL}
          />
        </Field>

        <Field label="Hasta" htmlFor="filter-to" className="col-span-1 tab:col-span-2 xl:col-span-1">
          <input
            id="filter-to"
            data-testid="filter-to"
            type="date"
            value={filter.to ?? ""}
            min={filter.from}
            onChange={(e) => set({ to: e.target.value || undefined })}
            className={CONTROL}
          />
        </Field>
      </div>
    </section>
  );
}

function Field({ label, htmlFor, className, children }: { label: string; htmlFor: string; className: string; children: ReactNode }) {
  return (
    <div className={`flex min-w-0 flex-col gap-1.5 ${className}`}>
      <label htmlFor={htmlFor} className="eyebrow text-mute">
        {label}
      </label>
      {children}
    </div>
  );
}
