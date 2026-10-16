import type { Metadata } from "next";
import { RangerApp } from "@/components/rangers/RangerApp";

// Rangers module: the field app for park rangers (offline reports with photo + GPS, bulk sync).
// It lives inside the landing under /rangers; its own manifest lets rangers install it with /rangers as start page.
export const metadata: Metadata = {
  title: "Guardaparques · Iberá",
  description: "Reportes ambientales de los guardaparques del Gran Parque Iberá. Funciona sin señal.",
  manifest: "/rangers.webmanifest",
  robots: { index: false, follow: false },
  appleWebApp: { capable: true, title: "Guardaparques", statusBarStyle: "black-translucent" },
};

export default function RangersPage() {
  return <RangerApp />;
}
