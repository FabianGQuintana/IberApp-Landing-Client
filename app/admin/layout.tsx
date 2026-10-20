import type { Metadata } from "next";
import { AdminShell } from "@/components/admin/shell/AdminShell";

// Admin panel: the administrator reviews and resolves the reports the rangers send from /rangers.
// Desktop first and always online, so it uses real routes (no service worker or manifest of its own).
export const metadata: Metadata = {
  title: { default: "Panel de administración · Iberá", template: "%s · Panel Iberá" },
  description: "Panel de administración de los reportes ambientales de los guardaparques del Gran Parque Iberá.",
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: LayoutProps<"/admin">) {
  return <AdminShell>{children}</AdminShell>;
}
