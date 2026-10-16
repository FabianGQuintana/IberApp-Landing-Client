"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export type Fix = { latitude: number; longitude: number; accuracy: number };
export type LocationStatus = "searching" | "ok" | "denied" | "unavailable";

/** Good enough for an incident: stop listening once the GPS is this precise (meters). */
const TARGET_ACCURACY = 20;
/** Never keep the GPS on for more than this (battery). */
const MAX_WATCH_MS = 90_000;

/**
 * Starts the GPS as soon as the screen opens, without asking anything on screen
 * (the browser shows its own permission prompt the first time). Keeps the most precise fix it gets.
 * The GPS works without mobile signal, so this works in the field.
 */
export function useSilentLocation() {
  const [fix, setFix] = useState<Fix | null>(null);
  const [status, setStatus] = useState<LocationStatus>("searching");
  const fixRef = useRef<Fix | null>(null);
  const waiters = useRef<((f: Fix | null) => void)[]>([]);

  useEffect(() => {
    const pending = waiters.current;
    if (!("geolocation" in navigator)) {
      queueMicrotask(() => setStatus("unavailable"));
      return;
    }

    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        const next = { latitude: pos.coords.latitude, longitude: pos.coords.longitude, accuracy: pos.coords.accuracy };
        if (!fixRef.current || next.accuracy <= fixRef.current.accuracy) {
          fixRef.current = next;
          setFix(next);
          setStatus("ok");
          waiters.current.splice(0).forEach((w) => w(next));
        }
        if (next.accuracy <= TARGET_ACCURACY) navigator.geolocation.clearWatch(watchId);
      },
      (err) => {
        if (fixRef.current) return; // keep the position we already have
        setStatus(err.code === err.PERMISSION_DENIED ? "denied" : "unavailable");
        if (err.code === err.PERMISSION_DENIED) waiters.current.splice(0).forEach((w) => w(null));
      },
      { enableHighAccuracy: true, maximumAge: 60_000, timeout: 30_000 },
    );

    const stop = window.setTimeout(() => navigator.geolocation.clearWatch(watchId), MAX_WATCH_MS);
    return () => {
      window.clearTimeout(stop);
      navigator.geolocation.clearWatch(watchId);
      pending.splice(0).forEach((w) => w(fixRef.current));
    };
  }, []);

  /** Returns the position now, or waits up to `ms` for the first one (used when saving). */
  const waitForFix = useCallback((ms: number) => {
    if (fixRef.current) return Promise.resolve(fixRef.current);
    return new Promise<Fix | null>((resolve) => {
      const timer = window.setTimeout(() => resolve(fixRef.current), ms);
      waiters.current.push((f) => {
        window.clearTimeout(timer);
        resolve(f);
      });
    });
  }, []);

  return { fix, status, waitForFix };
}
