"use client";

import { useEffect, useRef, useState } from "react";
import { DESIGN_SIZES, layoutFor } from "@/lib/games/shared/layout";
import { fitScene, toDesign } from "@/lib/games/shared/scene-fit";
import { ELEMENT_LABELS } from "@/lib/games/water-signs/meta";
import { FRAME, SCENE, ZONES } from "@/lib/games/water-signs/rules";

const GAP_PX = 4;

// water-signs overlay (ReadyEntry.overlay): the neutral name of each of the 15 elements, as DOM text over the scene
// while observing (the canvas never draws text). Each label sits just under its zone's circle, so it never covers the
// zone's center, and lets taps through (the wrapper renders overlays with pointer-events off). Placement uses the same
// pure fit as the scene: the stage box has the design's proportion and the canvas fills it.
export function Overlay() {
  const ref = useRef<HTMLDivElement>(null);
  const [box, setBox] = useState<{ width: number; height: number } | null>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    const observer = new ResizeObserver(() => setBox({ width: element.clientWidth, height: element.clientHeight }));
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  const placed = box && box.width > 0 && box.height > 0 ? place(box.width, box.height) : null;
  return (
    <div ref={ref} data-testid="scene-labels" className="absolute inset-0">
      {placed?.map(({ id, left, top, label }) => (
        <span
          key={id}
          data-label={id}
          className="absolute -translate-x-1/2 whitespace-nowrap rounded-[4px] bg-page-2/85 px-1.5 py-0.5 text-[12px] font-medium leading-tight text-fg"
          style={{ left, top }}
        >
          {label}
        </span>
      ))}
    </div>
  );
}

/** CSS px of every label in a stage box of width × height: under its zone, centered on it. */
function place(width: number, height: number) {
  const layout = layoutFor(width, height);
  const design = DESIGN_SIZES[layout];
  const scale = width / design.width;
  const fit = fitScene(design.width, design.height, SCENE.width, SCENE.height, layout === "portrait" ? FRAME : 0);
  return ZONES.map((zone) => {
    const bottom = toDesign(fit, zone.x, zone.y + zone.r);
    return { id: zone.id, left: bottom.x * scale, top: bottom.y * scale + GAP_PX, label: ELEMENT_LABELS[zone.id].label };
  });
}
