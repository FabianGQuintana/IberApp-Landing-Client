"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import type { ReportsView } from "./query";

const TABS: { view: ReportsView; label: string; icon: ReactNode }[] = [
  { view: "list", label: "Lista", icon: <path d="M8 6h12M8 12h12M8 18h12M4 6h.01M4 12h.01M4 18h.01" /> },
  { view: "map", label: "Mapa", icon: <path d="M12 21s-6-5.6-6-11a6 6 0 0 1 12 0c0 5.4-6 11-6 11zM12 12.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z" /> },
];

type Props = {
  view: ReportsView;
  /** URL of each view with the current filters (real links: they open in a new tab too) */
  hrefFor: (view: ReportsView) => string;
  onSelect: (view: ReportsView) => void;
};

/** "Lista · Mapa" switch in the page header. Both views share the filters of the URL. */
export function ViewTabs({ view, hrefFor, onSelect }: Props) {
  return (
    <nav aria-label="Vista de los reportes" className="flex gap-1 rounded-[12px] border border-rule bg-page-2 p-1">
      {TABS.map((tab) => {
        const on = tab.view === view;
        return (
          <Link
            key={tab.view}
            href={hrefFor(tab.view)}
            scroll={false}
            data-testid={`tab-${tab.view}`}
            aria-current={on ? "page" : undefined}
            onClick={(e) => {
              if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
              // Same page, other view: switch through the URL right away, without a server round trip
              e.preventDefault();
              if (!on) onSelect(tab.view);
            }}
            className={`flex h-10 items-center gap-2 rounded-[8px] px-4 text-[15px] font-semibold no-underline transition-colors ${
              on ? "bg-mint text-night hover:text-night" : "text-mute hover:bg-page hover:text-fg"
            }`}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              {tab.icon}
            </svg>
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
