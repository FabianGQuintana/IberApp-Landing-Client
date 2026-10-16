"use client";

import { useCallback, useSyncExternalStore } from "react";

export type View = "home" | "new-report" | "sync";

const VIEWS: View[] = ["home", "new-report", "sync"];

// true when the current screen was opened from the dashboard (so "back" returns to it)
let openedInApp = false;

const read = (): View => {
  const hash = window.location.hash.replace("#", "") as View;
  return VIEWS.includes(hash) ? hash : "home";
};

const subscribe = (cb: () => void) => {
  window.addEventListener("hashchange", cb);
  return () => window.removeEventListener("hashchange", cb);
};

/**
 * Which screen is open, kept in the URL hash (#new-report, #sync).
 * Using the hash means the phone's "back" button works as expected and the page is never reloaded.
 */
export function useView() {
  const view = useSyncExternalStore(subscribe, read, () => "home" as View);

  const go = useCallback((next: View) => {
    if (next === "home") {
      if (!window.location.hash) return;
      if (openedInApp) {
        // Going home = going back, so the history does not grow with every round trip
        openedInApp = false;
        window.history.back();
      } else {
        // The app was opened directly on a screen (e.g. reloaded on #sync): there is no "back" inside the app
        window.history.replaceState(null, "", window.location.pathname);
        window.dispatchEvent(new HashChangeEvent("hashchange"));
      }
      return;
    }
    openedInApp = true;
    window.location.hash = next;
  }, []);

  return { view, go };
}
