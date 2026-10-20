type Props = { url: string | null; size?: number };

/** Square photo thumbnail of a report, or a "Sin foto" box of the same size. Decorative: the row says what it is. */
export function ReportThumb({ url, size = 56 }: Props) {
  if (!url) {
    return (
      <span
        className="flex shrink-0 items-center justify-center rounded-[8px] border border-dashed border-rule text-center text-[11px] font-medium leading-tight text-mute"
        style={{ width: size, height: size }}
      >
        Sin foto
      </span>
    );
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element -- synced photos are blob: URLs in demo mode, next/image does not apply
    <img src={url} alt="" loading="lazy" decoding="async" className="shrink-0 rounded-[8px] bg-page-2 object-cover" style={{ width: size, height: size }} />
  );
}
