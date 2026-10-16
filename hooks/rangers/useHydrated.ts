"use client";

import { useSyncExternalStore } from "react";

const noop = () => () => {};

/** false while rendering on the server / hydrating, true afterwards (localStorage and IndexedDB are only on the phone). */
export function useHydrated() {
  return useSyncExternalStore(
    noop,
    () => true,
    () => false,
  );
}
