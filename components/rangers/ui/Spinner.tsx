type Props = { label: string };

/** Spinner always paired with a text that says what is happening. */
export function Spinner({ label }: Props) {
  return (
    <div role="status" aria-live="polite" className="flex flex-col items-center gap-3 py-4">
      <span aria-hidden="true" className="block size-11 animate-spin rounded-full border-4 border-rule border-t-mint [animation-duration:1.1s]" />
      <span className="text-center text-[16px] font-medium text-fg">{label}</span>
    </div>
  );
}
