// Narrative copy from Ibera Landing v6 (`LIT_A`, `LIT_B`, hero lines, section ids).

export const HERO_LINES = {
  water: "Un paisaje hecho de agua. Para descubrir, entender y cuidar.",
  shared: "El estero es de todos. Cuidarlo también.",
};

/** Words light up as the visitor scrolls through "Conectado por el agua". */
export const CONNECTED_BY_WATER =
  "En el Iberá todo está conectado por el agua. Lo que pasa en el pueblo llega a la laguna, y de la laguna a cada animal que vive en ella.";

export const FRAGILITY_INTRO = "Pero un ecosistema tan vivo también es vulnerable.";

/** Anchor ids used by the header, menu, footer and deep links (same as v6). */
export const SECTION_IDS = {
  hero: "descubrir",
  intro: "intro",
  territory: "territorio",
  roads: "caminos",
  portals: "portales",
  portalSheet: "ficha",
  ecosystem: "ecosistema",
  fragility: "fragilidad",
  play: "jugar",
  act: "actuar",
  future: "futuro",
} as const;

/** Header links (v6: `links`) */
export const NAV_LINKS = [
  { label: "Explorar", target: SECTION_IDS.territory },
  { label: "Visitar", target: SECTION_IDS.portals },
  { label: "Ecosistema", target: SECTION_IDS.ecosystem },
  { label: "Aprender", target: SECTION_IDS.play },
] as const;

export const EXTERNAL_LINKS = {
  park: "https://parqueibera.gob.ar/",
};
