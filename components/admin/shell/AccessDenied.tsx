"use client";

import Link from "next/link";
import { CenteredPanel } from "@/components/admin/shell/CenteredPanel";
import { clearAdminSession } from "@/lib/admin/session";
import type { UserProfile } from "@/types/rangers/auth";

/** A session without the Admin role: the panel stays closed, with a way out to the field app or to another user. */
export function AccessDenied({ user }: { user: UserProfile }) {
  return (
    <CenteredPanel eyebrow="Panel de administración" title="Tu usuario no tiene permiso para el panel">
      <p className="m-0 text-[17px]">
        Entraste como <strong>{user.name} {user.lastName}</strong> ({user.email}). El panel es solo para administradores.
      </p>
      <div className="flex flex-col gap-3">
        <Link
          href="/rangers"
          className="flex min-h-14 items-center justify-center gap-2.5 rounded-[10px] bg-mint px-5 text-[17px] font-semibold text-night no-underline transition-colors hover:bg-leaf hover:text-night"
        >
          Ir a la app de guardaparques
        </Link>
        <button
          type="button"
          onClick={clearAdminSession}
          className="min-h-14 rounded-[10px] border border-rule bg-transparent px-5 text-[17px] font-semibold text-fg transition-colors hover:border-fg"
        >
          Entrar con otro usuario
        </button>
      </div>
    </CenteredPanel>
  );
}
