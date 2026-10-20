import type { ReactNode } from "react";
import { AdminHeader } from "@/components/admin/shell/AdminHeader";

type Props = { eyebrow: string; title: ReactNode; children: ReactNode };

/** Desktop card centered on the page, for the panel screens without a session (login, access denied). */
export function CenteredPanel({ eyebrow, title, children }: Props) {
  return (
    <div className="flex min-h-svh flex-col bg-page text-fg">
      <AdminHeader />
      <main className="flex flex-1 items-start justify-center px-5 py-10 md:items-center">
        <section className="flex w-full max-w-[480px] flex-col gap-6 rounded-[12px] border border-rule bg-page-2 p-[clamp(20px,4vw,36px)]">
          <div className="flex flex-col gap-2">
            <span className="eyebrow text-mute">{eyebrow}</span>
            <h1 className="title-display m-0 text-[clamp(30px,4vw,40px)] leading-[0.95] text-head">{title}</h1>
          </div>
          {children}
        </section>
      </main>
    </div>
  );
}
