import type { Metadata } from "next";
import { ReportDetail } from "@/components/admin/report-detail/ReportDetail";

export const metadata: Metadata = { title: "Reporte" };

// The data loads in the browser (demo server or adminApi with the admin token), once the shell has a session.
export default async function ReportPage({ params, searchParams }: PageProps<"/admin/reportes/[id]">) {
  const [{ id }, { back }] = await Promise.all([params, searchParams]);
  // `back`: the list's query string (filters and view), so "Volver a reportes" restores them
  return <ReportDetail key={id} id={id} back={Array.isArray(back) ? back[0] : back} />;
}
