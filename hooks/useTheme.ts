"use client";

import { useCallback, useSyncExternalStore } from "react";

export type Theme = "dark" | "light";
const STORAGE_KEY = "ibera-theme"; // same key as Ibera Landing v6

const read = (): Theme => (document.documentElement.getAttribute("data-theme") === "light" ? "light" : "dark");

const subscribe = (cb: () => void) => {
  const observer = new MutationObserver(cb);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
  return () => observer.disconnect();
};

/** Current theme (from <html data-theme>, set before paint by ThemeScript) and a toggle. */
export function useTheme() {
  // Server and hydration render as dark (the default); the real value applies right after.
  const theme = useSyncExternalStore(subscribe, read, () => "dark" as Theme);

  const toggle = useCallback(() => {
    const next: Theme = read() === "dark" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", next);
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {}
  }, []);

  return { theme, isDark: theme === "dark", toggle };
}
