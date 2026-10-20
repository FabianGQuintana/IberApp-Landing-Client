type Props = {
  /** Some filter is set: the reports exist, they just do not match */
  filtered: boolean;
  onClear: () => void;
  className?: string;
};

/** No reports to show: none at all yet, or none for these filters (with a way back to all of them). */
export function EmptyState({ filtered, onClear, className = "" }: Props) {
  return (
    <div data-testid="reports-empty" className={`flex flex-col items-center gap-3 px-6 py-12 text-center ${className}`}>
      <p className="title-display m-0 text-[28px] leading-none text-head">{filtered ? "Ningún reporte coincide" : "Todavía no hay reportes"}</p>
      <p className="m-0 max-w-[46ch] text-[16px] text-mute">
        {filtered
          ? "Probá con otros filtros, o limpialos para ver todos los reportes."
          : "Cuando un guardaparque sincronice un reporte desde la app de campo, va a aparecer acá."}
      </p>
      {filtered ? (
        <button
          type="button"
          onClick={onClear}
          className="mt-2 min-h-12 rounded-[10px] bg-mint px-5 text-[16px] font-semibold text-night transition-colors hover:bg-leaf"
        >
          Limpiar filtros
        </button>
      ) : null}
    </div>
  );
}
