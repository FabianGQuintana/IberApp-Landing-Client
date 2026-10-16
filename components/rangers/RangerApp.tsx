"use client";

import { Logo } from "@/components/layout/Logo";
import { useEffect } from "react";
import { DashboardView } from "@/components/rangers/views/DashboardView";
import { LoginView } from "@/components/rangers/views/LoginView";
import { NewReportView } from "@/components/rangers/views/NewReportView";
import { SyncView } from "@/components/rangers/views/SyncView";
import { useHydrated } from "@/hooks/rangers/useHydrated";
import { usePendingReports } from "@/hooks/rangers/usePendingReports";
import { useSession } from "@/hooks/rangers/useSession";
import { useView } from "@/hooks/rangers/useView";
import { clearSession } from "@/lib/rangers/session";
import { requestPersistentStorage } from "@/lib/rangers/reports-db";

/**
 * The whole app is one page that switches views in memory. That way it opens and works without signal:
 * the service worker only has to keep "/" and the JS bundle.
 */
export function RangerApp() {
  const hydrated = useHydrated();
  const { session } = useSession();
  const { view, go } = useView();
  const { reports } = usePendingReports();

  useEffect(() => {
    requestPersistentStorage();
  }, []);

  // Until we read the phone's storage we do not know if there is a session: show a neutral splash.
  if (!hydrated) return <Splash />;

  if (!session) return <LoginView />;

  if (view === "new-report") return <NewReportView onDone={() => go("home")} />;

  if (view === "sync") return <SyncView onDone={() => go("home")} />;

  return (
    <DashboardView
      user={session.user}
      pendingCount={reports?.length ?? null}
      onNewReport={() => go("new-report")}
      onSync={() => go("sync")}
      onLogout={clearSession}
    />
  );
}

function Splash() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-4 bg-page text-head">
      <Logo className="h-12 w-[88px] animate-ib-breathe" />
      <p className="eyebrow m-0 text-mute">Guardaparques</p>
    </div>
  );
}
