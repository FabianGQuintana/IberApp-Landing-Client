import type { MountGame } from "@/lib/games/contract";
import type { ManifestEntry } from "@/lib/games/shared/assets";
import { mountPhaserGame } from "@/lib/games/shared/runtime";
import manifest from "./assets.manifest.json";
import { meta } from "./meta";
import { ChannelScene } from "./scenes/ChannelScene";

// Importing this module loads Phaser but runs nothing: no canvas, no requests, no listeners until mountGame().
export const mountGame: MountGame = (container, config) =>
  mountPhaserGame(container, config, { scenes: [ChannelScene], manifest: manifest as ManifestEntry[], total: meta.total, pointerSteer: true });
