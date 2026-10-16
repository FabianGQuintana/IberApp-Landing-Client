import * as Phaser from "phaser";
import { TOKEN_NAMES } from "@/lib/games/contract";
import { gameContext } from "./context";
import type { Palette } from "./palette";

/** One entry of a game's assets.manifest.json (plan §2.7). Sizes are file px = logical design px (density 1). */
export interface ManifestEntry {
  key: string;
  file: string;
  type: "image" | "spritesheet";
  width: number;
  height: number;
  format: "webp" | "png";
  alpha: boolean;
  frames: null | { count: number; frameWidth: number; frameHeight: number; fps: number; loop: boolean };
  maxKB: number;
  placeholder: string;
  use: string;
}

/**
 * preload(): queues every manifest file under assetBase. Spritesheets are loaded as plain images and sliced in
 * prepareManifest(), so a file with the wrong size can still be cut by the manifest's frame grid. A missing or broken
 * file only fails that file (FILE_LOAD_ERROR); the loader keeps going and the scene starts anyway.
 */
export function queueManifest(scene: Phaser.Scene) {
  const { assetBase, manifest } = gameContext(scene);
  scene.load.setPath(assetBase);
  for (const entry of manifest) scene.load.image(entry.key, entry.file);
}

/**
 * create(), before using any texture: leaves every manifest key with exactly the declared size and frames.
 * - file: the file matches the manifest; spritesheet frames are cut from it.
 * - scaled: the file has other dimensions (P19); it is redrawn at the manifest size under the same key, then cut.
 * - placeholder: the file is missing or broken; a texture is drawn in code (shape and token color taken from the
 *   entry's `placeholder` text, e.g. "círculo yellow de 128 px"), with the same key, size and frames. No text, ever.
 * Then creates one animation per spritesheet (key = entry key, the manifest's fps and loop).
 */
export function prepareManifest(scene: Phaser.Scene) {
  const context = gameContext(scene);
  const textures = scene.textures;
  for (const entry of context.manifest) {
    if (context.textureSources.has(entry.key)) continue; // already prepared (scene restart)
    let source: "file" | "scaled" | "placeholder" = "placeholder";
    if (textures.exists(entry.key)) {
      const image = textures.get(entry.key).getSourceImage() as HTMLImageElement | HTMLCanvasElement;
      if (image.width === entry.width && image.height === entry.height) {
        source = "file";
      } else {
        source = "scaled";
        redraw(textures, entry, (ctx) => ctx.drawImage(image, 0, 0, entry.width, entry.height));
      }
    } else {
      const { shape, color } = placeholderStyle(entry, context.palette());
      redraw(textures, entry, (ctx) => drawPlaceholder(ctx, entry, shape, color));
    }
    if (entry.frames) {
      const texture = textures.get(entry.key);
      const { count, frameWidth, frameHeight } = entry.frames;
      for (let i = 0; i < count; i++) if (!texture.has(String(i))) texture.add(i, 0, i * frameWidth, 0, frameWidth, frameHeight);
      if (!scene.anims.exists(entry.key)) {
        scene.anims.create({
          key: entry.key,
          frames: Array.from({ length: count }, (_, i) => ({ key: entry.key, frame: i })),
          frameRate: entry.frames.fps,
          repeat: entry.frames.loop ? -1 : 0,
        });
      }
    }
    context.textureSources.set(entry.key, source);
  }
}

/** Replaces (or creates) `entry.key` with a canvas texture of the manifest size drawn by `draw`. */
function redraw(textures: Phaser.Textures.TextureManager, entry: ManifestEntry, draw: (ctx: CanvasRenderingContext2D) => void) {
  const tempKey = `${entry.key}__ibera`;
  const texture = textures.createCanvas(tempKey, entry.width, entry.height);
  if (!texture) return;
  draw(texture.context);
  texture.refresh();
  if (textures.exists(entry.key)) textures.remove(entry.key);
  textures.renameTexture(tempKey, entry.key);
}

type PlaceholderShape = "circle" | "box";

function placeholderStyle(entry: ManifestEntry, palette: Palette) {
  const text = entry.placeholder.toLowerCase();
  const shape: PlaceholderShape = /c[íi]rculo|circle/.test(text) ? "circle" : "box";
  const token = TOKEN_NAMES.find((name) => new RegExp(`\\b${name}\\b`).test(text)) ?? "mute";
  return { shape, color: palette[token].css };
}

/** Each frame: the shape in the token color, a cross, and for strips a dot that advances one step per frame. */
function drawPlaceholder(ctx: CanvasRenderingContext2D, entry: ManifestEntry, shape: PlaceholderShape, color: string) {
  const frames = entry.frames ?? { count: 1, frameWidth: entry.width, frameHeight: entry.height };
  for (let i = 0; i < frames.count; i++) {
    const x = i * frames.frameWidth;
    const w = frames.frameWidth;
    const h = frames.frameHeight;
    const line = Math.max(2, Math.round(Math.min(w, h) / 32));
    ctx.save();
    ctx.fillStyle = color;
    ctx.strokeStyle = color;
    ctx.lineWidth = line;
    ctx.beginPath();
    if (shape === "circle") ctx.ellipse(x + w / 2, h / 2, w / 2 - line, h / 2 - line, 0, 0, Math.PI * 2);
    else ctx.rect(x + line / 2, line / 2, w - line, h - line);
    ctx.globalAlpha = 0.35;
    ctx.fill();
    ctx.globalAlpha = 1;
    ctx.stroke();
    const inset = shape === "circle" ? Math.min(w, h) * 0.3 : line;
    ctx.beginPath();
    ctx.moveTo(x + inset, inset);
    ctx.lineTo(x + w - inset, h - inset);
    ctx.moveTo(x + w - inset, inset);
    ctx.lineTo(x + inset, h - inset);
    ctx.stroke();
    if (frames.count > 1) {
      const r = Math.min(w, h) / 10;
      ctx.beginPath();
      ctx.arc(x + r * 2 + ((w - r * 4) * i) / (frames.count - 1), h - r * 2, r, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }
}

/** handle.debugTextures(): every manifest key with its real size and sliced frames. */
export function describeTextures(game: Phaser.Game, manifest: readonly ManifestEntry[], sources: Map<string, "file" | "scaled" | "placeholder">) {
  return manifest
    .filter((entry) => game.textures.exists(entry.key) && sources.has(entry.key))
    .map((entry) => {
      const texture = game.textures.get(entry.key);
      const image = texture.getSourceImage() as HTMLImageElement | HTMLCanvasElement;
      const sliced = texture.getFrameNames(false).length;
      return { key: entry.key, width: image.width, height: image.height, frames: Math.max(1, sliced), source: sources.get(entry.key)! };
    });
}
