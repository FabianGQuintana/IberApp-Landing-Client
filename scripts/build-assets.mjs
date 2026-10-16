#!/usr/bin/env node
// Rasteriza los SVG de assets-src/ a WebP en las medidas exactas del manifiesto.
//   node scripts/build-assets.mjs clean-channels
// Requiere: npm i -D sharp

import { readFileSync, mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import sharp from "sharp";

// Medidas exactas del manifiesto. Unica fuente de verdad.
const MANIFESTS = {
  "clean-channels": {
    "water-tile":            [720, 720],
    "bank-left":             [120, 720],
    "bank-right":            [120, 720],
    "kayak":                 [ 96, 140],
    "kayak-paddle":          [120,  30],
    "trash-batteries":       [ 72,  72],
    "trash-oily-container":  [ 72,  72],
    "trash-styrofoam":       [ 72,  72],
    "trash-glass-bottle":    [ 72,  72],
    "trash-pet-bottle":      [ 72,  72],
    "trash-can":             [ 72,  72],
    "trash-fruit-peel":      [ 72,  72],
    "obstacle-camalote":     [120,  96],
    "obstacle-log":          [160,  72],
  },
  "water-signs": {
    "scene":              [720, 900],
    "marker-signal":      [ 96,  96],
    "marker-distractor":  [ 96,  96],
  },
};

// El fondo del canal no lleva transparencia; el resto si.
const OPAQUE = new Set(["water-tile", "scene"]);

const game = process.argv[2];
const manifest = MANIFESTS[game];
if (!manifest) {
  console.error(`Uso: node build-assets.mjs <${Object.keys(MANIFESTS).join("|")}>`);
  process.exit(1);
}

const src = join("assets-src", game);
const out = join("public", "games", game);
mkdirSync(out, { recursive: true });

let total = 0, fallan = 0;

for (const [name, [w, h]] of Object.entries(manifest)) {
  const file = join(src, `${name}.svg`);
  let svg;
  try {
    svg = readFileSync(file);
  } catch {
    console.log(`  (falta)  ${name}.svg — queda como placeholder en el juego`);
    continue;
  }

  // Las medidas salen del manifiesto, nunca del SVG: no puede desincronizarse.
  const buf = await sharp(svg, { density: 384 })
    .resize(w, h, { fit: "fill", background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .webp({ quality: 82, alphaQuality: 100, effort: 6 })
    .toBuffer();

  const meta = await sharp(buf).metadata();
  if (meta.width !== w || meta.height !== h) {
    console.error(`  ERROR    ${name}: salio ${meta.width}x${meta.height}, se esperaba ${w}x${h}`);
    fallan++;
    continue;
  }

  writeFileSync(join(out, `${name}.webp`), buf);
  total += buf.length;
  const kb = (buf.length / 1024).toFixed(1);
  console.log(`  ok       ${name}.webp  ${w}x${h}  ${kb} KB${OPAQUE.has(name) ? "  (opaco)" : ""}`);
}

console.log(`\nTotal: ${(total / 1024).toFixed(1)} KB  (presupuesto 400 KB)`);
if (total > 400 * 1024) { console.error("Se paso del presupuesto."); process.exit(1); }
if (fallan) process.exit(1);
