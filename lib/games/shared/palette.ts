import { TOKEN_NAMES, type GameTokens, type TokenName } from "@/lib/games/contract";

/** A token as Phaser wants it: 0xRRGGBB plus alpha (tokens like --rule carry transparency). */
export interface PaletteColor {
  color: number;
  alpha: number;
  /** The original CSS string, for Canvas 2D drawing (placeholders). */
  css: string;
}

export type Palette = Record<TokenName, PaletteColor>;

export function toPalette(tokens: GameTokens): Palette {
  return Object.fromEntries(TOKEN_NAMES.map((name) => [name, parseCssColor(tokens[name])])) as Palette;
}

/** Parses the color formats globals.css uses: #rgb, #rrggbb, #rrggbbaa, rgb() and rgba(). Unknown values give black. */
export function parseCssColor(value: string): PaletteColor {
  const css = value.trim();
  const hex = css.match(/^#([0-9a-f]{3}|[0-9a-f]{6}|[0-9a-f]{8})$/i);
  if (hex) {
    const digits = hex[1].length === 3 ? [...hex[1]].map((d) => d + d).join("") : hex[1];
    const alpha = digits.length === 8 ? parseInt(digits.slice(6, 8), 16) / 255 : 1;
    return { color: parseInt(digits.slice(0, 6), 16), alpha, css };
  }
  const rgb = css.match(/^rgba?\(\s*([\d.]+)[\s,]+([\d.]+)[\s,]+([\d.]+)(?:\s*[,/]\s*([\d.]+%?))?\s*\)$/i);
  if (rgb) {
    const [r, g, b] = rgb.slice(1, 4).map((c) => Math.max(0, Math.min(255, Math.round(Number(c)))));
    const a = rgb[4] === undefined ? 1 : rgb[4].endsWith("%") ? Number(rgb[4].slice(0, -1)) / 100 : Number(rgb[4]);
    return { color: (r << 16) | (g << 8) | b, alpha: Number.isFinite(a) ? a : 1, css };
  }
  return { color: 0x000000, alpha: 1, css: css || "#000000" };
}
