import type { Metadata, Viewport } from "next";
import { Barlow, Barlow_Semi_Condensed } from "next/font/google";
import { ThemeScript } from "@/components/theme/ThemeScript";
import "./globals.css";

// Same families and weights as Ibera Landing v6's Google Fonts link.
const barlow = Barlow({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  style: ["normal", "italic"],
  variable: "--font-barlow",
  display: "swap",
});

const barlowCondensed = Barlow_Semi_Condensed({
  subsets: ["latin"],
  weight: ["700", "800"],
  variable: "--font-barlow-condensed",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  title: "Iberá · Un paisaje hecho de agua",
  description:
    "Gran Parque Iberá, Corrientes. Explorá los portales y el estado de sus caminos, conocé el ecosistema, aprendé jugando y reportá lo que daña el estero.",
  applicationName: "IberAPP",
  openGraph: { images: ["/img/wetlands.webp"], locale: "es_AR", type: "website" },
};

export const viewport: Viewport = {
  themeColor: "#0B100E",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    // The inline ThemeScript may change data-theme before hydration.
    <html lang="es-AR" data-theme="dark" data-scroll-behavior="smooth" suppressHydrationWarning className={`${barlow.variable} ${barlowCondensed.variable}`}>
      <head>
        <ThemeScript />
      </head>
      <body>{children}</body>
    </html>
  );
}
