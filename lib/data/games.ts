import type { Game, WasteItem, WaterSign } from "@/types/game";

// Source: `GAMES`, `G1`, `G2`, `STARS`, `BARS` and the night-voices options in Ibera Landing v6.

export const GAMES: Game[] = [
  {
    id: "clean-channels",
    title: "Canales limpios",
    meta: "Kayak · Residuos · Laguna Iberá",
    description: "Tocá los residuos que flotan en el canal. Cinco piezas, y una pregunta: ¿de dónde vienen?",
    portalId: "laguna",
  },
  {
    id: "water-signs",
    title: "Señales del agua",
    meta: "Senderismo · Lixiviados · San Nicolás",
    description: "Recorré la imagen y encontrá tres señales de que el agua está cambiando.",
    portalId: "sannicolas",
  },
  {
    id: "dark-sky",
    title: "Cielo oscuro",
    meta: "Astroturismo · Luz artificial · Carambola",
    description: "Mové el control del estero a la ciudad y mirá cuántas estrellas se pierden.",
    portalId: "carambola",
  },
  {
    id: "night-voices",
    title: "Voces de la noche",
    meta: "Safari nocturno · Fauna · Cambyretá",
    description: "Escuchá el sonido y adiviná quién lo hace, como los guías en las salidas nocturnas.",
    portalId: "cambyreta",
  },
];

export const WASTE_ITEMS: WasteItem[] = [
  { x: 22, y: 62, icon: "trash", duration: "3.1s", delay: "0s" },
  { x: 38, y: 76, icon: "drop", duration: "3.8s", delay: "-1.2s" },
  { x: 56, y: 58, icon: "trash", duration: "3.4s", delay: "-.6s" },
  { x: 71, y: 74, icon: "trash", duration: "4.2s", delay: "-2s" },
  { x: 84, y: 60, icon: "drop", duration: "3.6s", delay: "-.3s" },
];

export const WATER_SIGNS: WaterSign[] = [
  { key: "turbid", x: 30, y: 72, title: "Agua turbia", text: "Puede indicar sedimentos o contaminación." },
  { key: "plants", x: 64, y: 44, title: "Vegetación inusual", text: "Algunas plantas crecen de más cuando el agua recibe nutrientes de la basura." },
  { key: "fish", x: 48, y: 84, title: "Sin peces", text: "Si los peces se van de una zona, algo cambió en el agua." },
  { key: "waste", x: 82, y: 66, title: "Residuos cerca", text: "La basura acumulada cerca del agua es el origen de los lixiviados." },
];

export const NIGHT_VOICES = {
  answer: "bird",
  options: [
    { key: "caiman", label: "Yacaré", feedback: "El yacaré se comunica con gruñidos graves, casi vibraciones." },
    { key: "capybara", label: "Carpincho", feedback: "El carpincho silba y chasquea, pero en tono corto y agudo." },
    { key: "bird", label: "Ave nocturna", feedback: "De día se queda inmóvil imitando una rama. De noche, su canto descendente recorre el estero." },
  ],
  correctTitle: "Correcto: un urutaú",
  /** Descending call synthesized with Web Audio (no audio files): [startHz, endHz] per note, 0.62 s apart */
  notes: [
    [880, 700],
    [760, 560],
    [640, 470],
    [520, 400],
  ] as [number, number][],
};

/** Deterministic pseudo-random in [0, 1) so server and client render the same values (v6 uses this formula). */
const seeded = (i: number, n: number, a: number, b: number, c: number) => {
  const v = Math.sin(i * a + n * b) * c;
  return v - Math.floor(v);
};

/** 140 stars for "Cielo oscuro" (v6: `STARS`) */
export const STARS = Array.from({ length: 140 }, (_, i) => {
  const f = (n: number) => seeded(i, n, 12.9898, 78.233, 43758.5453);
  return { x: +(f(1) * 100).toFixed(2), y: +(f(2) * 82).toFixed(2), brightness: f(3), radius: f(4) > 0.88 ? 2.6 : f(4) > 0.55 ? 1.8 : 1.2 };
});

/** 44 sound-wave bars for "Voces de la noche" (v6: `BARS`) */
export const WAVE_BARS = Array.from({ length: 44 }, (_, i) => {
  const f = (n: number) => seeded(i, n, 7.13, 3.7, 9137.13);
  const envelope = Math.sin((i / 43) * Math.PI);
  return {
    height: Math.round(14 + envelope * 58 * (0.5 + f(1) * 0.5)),
    duration: (0.7 + f(2) * 0.7).toFixed(2) + "s",
    delay: (-f(3)).toFixed(2) + "s",
    opacity: (0.45 + envelope * 0.55).toFixed(2),
  };
});

/** Visible stars for the "Cielo oscuro" slider value (0 = estero, 100 = ciudad). Illustrative figure. */
export const visibleStars = (value: number) => Math.round(2400 - (2400 - 150) * Math.pow(value / 100, 0.7));
