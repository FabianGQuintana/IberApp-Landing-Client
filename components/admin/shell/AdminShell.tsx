"use client";

import { useState, type ReactNode } from "react";
import { AccessDenied } from "@/components/admin/shell/AccessDenied";
import { AdminHeader } from "@/components/admin/shell/AdminHeader";
import { CenteredPanel } from "@/components/admin/shell/CenteredPanel";
import { DemoStrip } from "@/components/admin/shell/DemoStrip";
import { ADMIN_CONTAINER } from "@/components/admin/shell/container";
import { LoginForm } from "@/components/auth/LoginForm";
import { Logo } from "@/components/layout/Logo";
import { useAdminSession } from "@/hooks/admin/useAdminSession";
import { useHydrated } from "@/hooks/rangers/useHydrated";
import { DEMO_MODE } from "@/lib/rangers/demo";
import { isAdmin } from "@/services/admin/auth";

/**
 * Session and role gate of every /admin page, plus the header. Pages only render their own content:
 * they mount once there is a valid admin session, so they can call services/admin right away.
 */
export function AdminShell({ children }: { children: ReactNode }) {
  const hydrated = useHydrated();
  const { session, tokenValid } = useAdminSession();
  // Bumped by "Restablecer datos de prueba": remounting the page makes it load the fresh demo data
  const [dataVersion, setDataVersion] = useState(0);

  // Until we read localStorage we do not know if there is a session: show a neutral splash.
  if (!hydrated) return <Splash />;

  if (!session || !tokenValid) {
    return (
      <CenteredPanel eyebrow="Panel de administración" title="Ingresar">
        <LoginForm
          module="admin"
          // In demo mode keep the box with the test accounts, which the notice would hide
          reason={session && !DEMO_MODE ? "Tu sesión venció. Entrá de nuevo para seguir." : undefined}
          defaultEmail={session?.user.email}
        />
      </CenteredPanel>
    );
  }

  if (!isAdmin(session.user)) return <AccessDenied user={session.user} />;

  return (
    <div className="flex min-h-svh flex-col bg-page text-fg">
      <AdminHeader user={session.user} />
      {DEMO_MODE ? <DemoStrip onReset={() => setDataVersion((v) => v + 1)} /> : null}
      <main key={dataVersion} className={`${ADMIN_CONTAINER} flex flex-1 flex-col gap-6 py-8`}>
        {children}
      </main>
    </div>
  );
}

function Splash() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-4 bg-page text-head">
      <Logo className="h-12 w-[88px] animate-ib-breathe" />
      <p className="eyebrow m-0 text-mute">Panel de administración</p>
    </div>
  );
}
