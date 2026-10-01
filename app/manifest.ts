import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Iberá · Un paisaje hecho de agua",
    short_name: "Iberá",
    description: "Portales, ecosistema, minijuegos y reportes ambientales del Gran Parque Iberá.",
    start_url: "/",
    display: "standalone",
    background_color: "#0B100E",
    theme_color: "#0B100E",
    lang: "es-AR",
    icons: [{ src: "/favicon.ico", sizes: "any", type: "image/x-icon" }],
  };
}
