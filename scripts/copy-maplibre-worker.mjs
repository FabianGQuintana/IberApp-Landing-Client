// MapLibre GL 6 loads its web worker from a URL next to its own module (import.meta.url).
// Bundled by Next.js that file does not exist, so we serve the worker (and the shared chunk it imports)
// from public/ and point MapLibre at it with setWorkerUrl (see components/map/MapView.tsx).
// Runs before `next dev` and `next build` so the copy always matches the installed version.
import { copyFileSync, mkdirSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";

const require = createRequire(import.meta.url);
const dist = join(dirname(require.resolve("maplibre-gl/package.json")), "dist");
const out = join(process.cwd(), "public", "vendor", "maplibre");
mkdirSync(out, { recursive: true });
for (const file of ["maplibre-gl-worker.mjs", "maplibre-gl-shared.mjs"]) copyFileSync(join(dist, file), join(out, file));
console.log(`maplibre worker → public/vendor/maplibre (v${require("maplibre-gl/package.json").version})`);
