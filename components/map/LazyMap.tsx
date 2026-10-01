"use client";

import dynamic from "next/dynamic";
import { MapFallback } from "./MapFallback";
import type { MapPoint, MapViewProps } from "./MapView";

// MapLibre needs WebGL and `window`: it never renders on the server.
// `ssr: false` only works inside a Client Component (Next 16 docs, lazy-loading).
const MapView = dynamic(() => import("./MapView"), {
  ssr: false,
  loading: () => <MapFallback />,
});

export function LazyMap<P extends MapPoint>(props: MapViewProps<P>) {
  // `dynamic` drops the generic; types are enforced by LazyMap's signature.
  return <MapView {...(props as unknown as MapViewProps<MapPoint>)} />;
}
