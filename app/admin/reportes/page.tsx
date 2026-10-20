import type { Metadata } from "next";
import { Suspense } from "react";
import { ReportsScreen } from "@/components/admin/reports/ReportsScreen";
import { Spinner } from "@/components/rangers/ui/Spinner";

export const metadata: Metadata = { title: "Reportes" };

// Filters and view live in the URL (useSearchParams), so the screen is rendered on the client under Suspense.
export default function ReportsPage() {
  return (
    <Suspense fallback={<Spinner label="Cargando reportes…" />}>
      <ReportsScreen />
    </Suspense>
  );
}
