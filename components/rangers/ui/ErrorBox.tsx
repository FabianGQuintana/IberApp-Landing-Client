type Props = { message: string | null };

/** Error message that stands out in both themes: red edge, icon and readable text, read aloud by screen readers. */
export function ErrorBox({ message }: Props) {
  if (!message) return null;
  return (
    <p role="alert" className="m-0 flex items-start gap-3 rounded-[10px] border border-[#e5484d] border-l-4 bg-[#e5484d]/10 p-4 text-[16px] font-medium text-fg">
      <span aria-hidden="true">⚠️</span>
      <span>{message}</span>
    </p>
  );
}
