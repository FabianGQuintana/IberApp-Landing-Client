// Logical design resolutions (P17). Same short side (720) in both, so a manifest asset keeps its on-screen proportion
// in 16:9 and in 4:5. Density 1 (P18): the canvas backing store is exactly this size and CSS scales it (Scale.FIT).
export const DESIGN_SIZES = {
  landscape: { width: 1280, height: 720 },
  portrait: { width: 720, height: 900 },
} as const;

export type DesignLayout = keyof typeof DESIGN_SIZES;

/** The section is 16:9 from 700 px and 4:5 below, so the container's aspect decides the layout. */
export function layoutFor(width: number, height: number): DesignLayout {
  return height > 0 && width / height < 1 ? "portrait" : "landscape";
}
