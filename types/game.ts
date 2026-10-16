import type { GameId } from "./portal";

// TEAM PACT (guide, sections 1 and 10): `Game` is the stable contract with the rest of the page; the games themselves
// are redesigned and do not copy v6's mechanics.
export interface Game {
  id: GameId;
  title: string;
  /** Activity · issue · portal line (v6: `meta`) */
  meta: string;
  description: string;
  portalId: string;
}
