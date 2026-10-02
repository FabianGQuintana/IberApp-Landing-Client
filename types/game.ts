import type { IconName } from "@/components/ui/Icon";
import type { GameId } from "./portal";

// TEAM PACT (guide, sections 1 and 10): `Game` is the stable contract with the rest of the page; the games themselves
// are redesigned and do not copy v6's mechanics. `WasteItem` and `WaterSign` are v6-specific and may disappear.
export interface Game {
  id: GameId;
  title: string;
  /** Activity · issue · portal line (v6: `meta`) */
  meta: string;
  description: string;
  portalId: string;
}

/** Floating waste item in "Canales limpios" (v6: `G1`) */
export interface WasteItem {
  x: number;
  y: number;
  icon: IconName;
  duration: string;
  delay: string;
}

/** Hotspot in "Señales del agua" (v6: `G2`) */
export interface WaterSign {
  key: string;
  x: number;
  y: number;
  title: string;
  text: string;
}
