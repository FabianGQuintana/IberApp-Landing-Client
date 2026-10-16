// Fixed-scene games (E2): one scene in its own coordinate space (e.g. 720 × 900), shown whole inside the design size
// of the current layout (P17), centered, never cropped. What is left around it is the camera background (bg2), so it
// follows the theme (C19). `inset` keeps a bg2 frame of that many design px around the scene.

/** Where the scene sits in the design: top-left corner and scale, in design px. */
export interface SceneFit {
  x: number;
  y: number;
  scale: number;
}

export function fitScene(designWidth: number, designHeight: number, sceneWidth: number, sceneHeight: number, inset = 0): SceneFit {
  const scale = Math.min((designWidth - inset * 2) / sceneWidth, (designHeight - inset * 2) / sceneHeight);
  return { x: (designWidth - sceneWidth * scale) / 2, y: (designHeight - sceneHeight * scale) / 2, scale };
}

/** Scene px → design px. */
export function toDesign(fit: SceneFit, x: number, y: number) {
  return { x: fit.x + x * fit.scale, y: fit.y + y * fit.scale };
}

/** Design px → scene px. */
export function toScene(fit: SceneFit, x: number, y: number) {
  return { x: (x - fit.x) / fit.scale, y: (y - fit.y) / fit.scale };
}
