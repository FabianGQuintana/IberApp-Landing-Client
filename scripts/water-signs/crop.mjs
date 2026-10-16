import sharp from "sharp";
import { SPOTS } from "./spots.mjs";
const id = process.argv[2], pad = 26;
const s = SPOTS.find(x => x.id === id);
const L = Math.round(s.x - s.r - pad), T = Math.round(s.y - s.r - pad), D = Math.round((s.r + pad) * 2);
await sharp("webp/scene.webp").extract({ left: L, top: T, width: D, height: D })
  .resize(D * 4, D * 4, { kernel: "nearest" }).png().toFile(`crop-${id}.png`);
console.log(`crop-${id}.png  (${D}x${D} -> x4)`);
