"use client";

import { useEffect, useState } from "react";
import { listReports, subscribeReports } from "@/lib/rangers/reports-db";
import type { PendingReport } from "@/types/rangers/report";

/** Reports saved on the phone and not yet sent. `null` while reading the database. */
export function usePendingReports() {
  const [reports, setReports] = useState<PendingReport[] | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    let alive = true;
    const load = () =>
      listReports()
        .then((items) => alive && setReports(items))
        .catch(() => alive && setError(true));

    load();
    const unsubscribe = subscribeReports(load);
    return () => {
      alive = false;
      unsubscribe();
    };
  }, []);

  return { reports, error };
}
