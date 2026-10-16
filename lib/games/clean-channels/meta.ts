import type { GameMeta } from "@/lib/games/contract";

// clean-channels (Canales limpios): kayak run collecting floating waste, then classifying it (user specification,
// G1·0 decisions). Pure data: no Phaser. Every text is the user's (11/10/2026), copied literally.
//
// `completed` is always true when the run ends (the game cannot be lost). `total` = waste collected, `hits` = waste
// classified into the right bin, `score` = points of the waste classified right (the damage avoided).

export type BinId = "recyclable" | "organic" | "general" | "special";
export type WasteId = "batteries" | "oily-container" | "styrofoam" | "glass-bottle" | "pet-bottle" | "can" | "fruit-peel";

export const BINS: { id: BinId; label: string }[] = [
  { id: "recyclable", label: "Reciclable" },
  { id: "organic", label: "Orgánico" },
  { id: "general", label: "Basura general" },
  { id: "special", label: "Residuos especiales" },
];

export interface WasteInfo {
  name: string;
  bin: BinId;
  /** Damage avoided (specification table). */
  points: number;
  /** Shown when classified right. */
  correct: string;
  /** Shown when classified wrong (the right bin is shown next to it). */
  wrong: string;
}

export const WASTE: Record<WasteId, WasteInfo> = {
  batteries: {
    name: "Pilas",
    bin: "special",
    points: 40,
    correct: "Las pilas tienen metales pesados. En un basural, el agua de lluvia los arrastra y terminan en la laguna.",
    wrong: "Van en residuos especiales. En la basura común sus metales se filtran al suelo y llegan al agua del estero.",
  },
  "oily-container": {
    name: "Envase plástico con restos de aceite",
    bin: "general",
    points: 25,
    correct: "Exacto: el plástico con restos de aceite ya no se recicla. Si entra al lote, arruina todo lo demás.",
    wrong: "Parece reciclable, pero no lo es. Con restos de aceite va a basura general, porque contamina el lote entero.",
  },
  styrofoam: {
    name: "Telgopor",
    bin: "general",
    points: 20,
    correct: "Bien visto. Casi no se recicla, y flotando se deshace en pedacitos que los peces confunden con comida.",
    wrong: "El telgopor va a basura general: casi no se recicla. En el agua se rompe en pedacitos que los peces tragan.",
  },
  "glass-bottle": {
    name: "Botella de vidrio",
    bin: "recyclable",
    points: 10,
    correct: "El vidrio se recicla una y otra vez sin perder calidad. Sacarlo del agua también evita cortes en la costa.",
    wrong: "El vidrio es reciclable, y de los mejores: se puede reciclar indefinidamente sin perder calidad.",
  },
  "pet-bottle": {
    name: "Botella PET",
    bin: "recyclable",
    points: 10,
    correct: "Bien. La botella limpia es reciclable. En el canal flota mucho tiempo y el viento la lleva lejos.",
    wrong: "La botella PET limpia va a reciclable. Es el residuo más común en los canales, justamente porque flota.",
  },
  can: {
    name: "Lata de aluminio",
    bin: "recyclable",
    points: 10,
    correct: "El aluminio se recupera casi entero y usa mucha menos energía que fabricar una lata nueva.",
    wrong: "La lata va a reciclable. El aluminio es de lo más valioso que se recupera: se usa casi todo de nuevo.",
  },
  "fruit-peel": {
    name: "Cáscara de fruta",
    bin: "organic",
    points: 5,
    correct: "Va a orgánico y termina en compost. Igual, que se degrade no significa que esté bien tirarla al agua.",
    wrong: "La cáscara va a orgánico: se degrada y sirve como compost, a diferencia de todo lo demás que juntaste.",
  },
};

export const meta: GameMeta = {
  instructions: [
    "Remá por el canal y recolectá los residuos que flotan. Los camalotes y los troncos solo te sacuden: no restan nada.",
    "Al final del recorrido vas a clasificar cada residuo que juntaste en uno de cuatro contenedores.",
  ],
  controls: {
    pointer: "Mantené apretado sobre el canal y mové el puntero o el dedo hacia los costados: el kayak lo sigue.",
    keyboard: "Con el escenario enfocado, usá las flechas izquierda y derecha. En la clasificación, Tab y Enter.",
  },
  // Closing text of phase 4 (user, 11/10/2026): two paragraphs; the first one also explains the score scale. The
  // second bridges to water-signs and to the report section: review it if game 2 is renamed.
  learning: "No todos los residuos hacen el mismo daño. Por eso una bolsa de pilas vale ocho veces más que una cáscara: lo que juntaste se mide por lo que evitaste, no por cuánto pesa.\nLo que queda en un basural no se queda ahí. El agua de lluvia lo atraviesa, arrastra lo que puede disolver y se filtra hasta la laguna. A eso se le dice lixiviado, y no se ve.",
  total: 15,
  scoreLabel: "bien clasificados",
  // The 16:9 margins and the 4:5 side frame are bg2 (drawn by code): this point is in both.
  backgroundProbe: { x: 8, y: 450 },
  // The channel scrolls by itself: that motion is the play. reducedMotion stops only shakes, flashes and the kayak's tilt.
  essentialMotion: true,
  difficulties: [
    { id: "calm", label: "Tranquilo", total: 10 },
    { id: "normal", label: "Normal", total: 12 },
    { id: "fast", label: "Rápido", total: 15 },
  ],
  defaultDifficulty: "calm",
  collectLabel: "recolectados",
  emptyResult: {
    title: "El canal quedó como lo encontraste",
    text: "Movete con las flechas o arrastrando el dedo para cruzarte con los residuos antes de que pasen de largo. En modo Tranquilo vienen más espaciados.",
  },
  pointsLabel: "puntos de daño evitado",
  // Four synthesized effects (sounds.ts): the wrapper owns the audio and shows the mute button (G1b).
  sounds: true,
};
