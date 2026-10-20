import { PORTALS } from "@/lib/data/portals";
import type { Portal } from "@/types/portal";

type LatLng = { lat: number; lng: number };

/** Great-circle distance in km (haversine). */
export function distanceKm(a: LatLng, b: LatLng) {
  const R = 6371;
  const rad = (d: number) => (d * Math.PI) / 180;
  const dLat = rad(b.lat - a.lat);
  const dLng = rad(b.lng - a.lng);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

/** The portal closest to the point (the national park counts too), with its distance in km. */
export function nearestPortal(point: LatLng, portals: Portal[] = PORTALS): { portal: Portal; km: number } | null {
  let best: { portal: Portal; km: number } | null = null;
  for (const portal of portals) {
    const km = distanceKm(point, portal);
    if (!best || km < best.km) best = { portal, km };
  }
  return best;
}
