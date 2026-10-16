// Generado por scripts/build-water-signs.mjs — no editar a mano.
// La escena (scene.webp) se dibuja a partir de estas mismas coordenadas,
// asi que no hace falta medir nada sobre la imagen.

export const SCENE_WIDTH = 720;
export const SCENE_HEIGHT = 900;

export type HotspotKind = "signal" | "distractor";

export interface Hotspot {
  id: string;
  kind: HotspotKind;
  x: number;
  y: number;
  r: number;
}

export const HOTSPOTS: readonly Hotspot[] = [
  { id: "buried-waste",      kind: "signal",     x: 120, y: 110, r: 56 },
  { id: "dead-vegetation",   kind: "signal",     x: 300, y: 110, r: 56 },
  { id: "stirred-mud",       kind: "distractor", x: 490, y: 110, r: 52 },
  { id: "capybara",          kind: "distractor", x: 640, y: 110, r: 52 },
  { id: "algae-bloom",       kind: "signal",     x: 120, y: 290, r: 56 },
  { id: "oil-sheen",         kind: "signal",     x: 300, y: 290, r: 56 },
  { id: "camalote",          kind: "distractor", x: 490, y: 290, r: 52 },
  { id: "tannin-water",      kind: "distractor", x: 640, y: 290, r: 60 },
  { id: "persistent-foam",   kind: "signal",     x: 120, y: 460, r: 56 },
  { id: "irupe",             kind: "distractor", x: 300, y: 460, r: 52 },
  { id: "dead-fish",         kind: "signal",     x: 490, y: 460, r: 60 },
  { id: "sunken-log",        kind: "distractor", x: 640, y: 460, r: 52 },
  { id: "bottom-bubbling",   kind: "signal",     x: 160, y: 630, r: 56 },
  { id: "murky-patch",       kind: "signal",     x: 400, y: 630, r: 56 },
  { id: "caiman",            kind: "distractor", x: 300, y: 810, r: 56 },
] as const;
