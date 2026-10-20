import type { ReactNode } from "react";

type Props = {
  title: ReactNode;
  description?: ReactNode;
  /** Buttons or links aligned to the right of the title (e.g. "Nueva categoría") */
  actions?: ReactNode;
};

/** Title block every panel page starts with, so all of them look the same under the header. */
export function PageHeader({ title, description, actions }: Props) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div className="flex flex-col gap-2">
        <h1 className="title-display m-0 text-[clamp(32px,4vw,48px)] leading-[0.95] text-head">{title}</h1>
        {description ? <p className="m-0 text-[16px] text-mute">{description}</p> : null}
      </div>
      {actions ? <div className="flex flex-wrap items-center gap-3">{actions}</div> : null}
    </div>
  );
}
