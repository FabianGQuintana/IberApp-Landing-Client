import type { Game } from "@/types/game";

// TEAM PACT (docs/GUIA_IMPLEMENTACION.md, sections 1 and 10): the minigames are NOT replicated from landing v6.
// v6's mechanics are reference only; the team wants to build something better. What stays is this contract
// (ids, title, meta, description and linked portal), which the portal sheet, Fragility, the games index and LandingContext rely on.
// Source: `GAMES` in Ibera Landing v6. Its per-mechanic data (G1, G2, STARS, BARS, night voices) was removed:
// each redesigned game owns its data under lib/games/.

export const GAMES: Game[] = [
  {
    id: "clean-channels",
    title: "Canales limpios",
    meta: "Kayak · Residuos · Laguna Iberá",
    description: "Remá por el canal y juntá los residuos que flotan. Después clasificalos: no todos hacen el mismo daño.",
    portalId: "laguna",
  },
  {
    id: "water-signs",
    title: "Señales del agua",
    meta: "Senderismo · Lixiviados · San Nicolás",
    description: "Mirá la laguna y marcá las señales de que el agua está contaminada. Ojo: no todo lo raro es contaminación.",
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
