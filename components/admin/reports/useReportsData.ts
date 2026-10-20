"use client";

import { useEffect, useState } from "react";
import { ApiError, OfflineError } from "@/lib/api/client";
import { getCategories } from "@/services/admin/categories";
import { getReports } from "@/services/admin/reports";
import { getStaff } from "@/services/admin/staff";
import type { ReportCategory, ReportFilter, ReportResponse, StaffMember } from "@/types/admin/report";

/** Answer of one request, tagged with the inputs it was made for: a different key means it is stale. */
type Loaded<T> = { key: string; data: T; error: null } | { key: string; data: null; error: string };

function errorMessage(err: unknown, fallback: string) {
  if (err instanceof OfflineError) return "No hay conexión con el servidor. Probá de nuevo en unos minutos.";
  if (err instanceof ApiError) return err.message;
  return fallback;
}

/**
 * Reports that match every filter except the status. The screen counts them by status and applies the status
 * itself, so the counters and the list always come from the same answer (and picking a status is instant).
 * While new filters load, `reports` keeps the previous answer so the list does not flash empty.
 */
export function useReports({ categoryId, reportedById, from, to }: ReportFilter) {
  const [attempt, setAttempt] = useState(0);
  const [result, setResult] = useState<Loaded<ReportResponse[]> | null>(null);
  const key = JSON.stringify([categoryId, reportedById, from, to, attempt]);

  useEffect(() => {
    let alive = true;
    getReports({ categoryId, reportedById, from, to }).then(
      (data) => alive && setResult({ key, data, error: null }),
      (err) => alive && setResult({ key, data: null, error: errorMessage(err, "No pudimos cargar los reportes. Probá de nuevo.") }),
    );
    return () => {
      alive = false;
    };
  }, [key, categoryId, reportedById, from, to]);

  const current = result?.key === key ? result : null;
  return {
    reports: result?.data ?? null,
    loading: !current,
    error: current?.error ?? null,
    retry: () => setAttempt((a) => a + 1),
  };
}

/** Options of the "Categoría" and "Reportado por" filters, loaded once. */
export function useFilterOptions() {
  const [attempt, setAttempt] = useState(0);
  const [result, setResult] = useState<Loaded<{ categories: ReportCategory[]; staff: StaffMember[] }> | null>(null);

  useEffect(() => {
    let alive = true;
    const key = String(attempt);
    Promise.all([getCategories(), getStaff()]).then(
      ([categories, staff]) => alive && setResult({ key, data: { categories, staff }, error: null }),
      (err) => alive && setResult({ key, data: null, error: errorMessage(err, "No pudimos cargar las opciones de los filtros. Probá de nuevo.") }),
    );
    return () => {
      alive = false;
    };
  }, [attempt]);

  const current = result?.key === String(attempt) ? result : null;
  return {
    categories: current?.data?.categories ?? null,
    staff: current?.data?.staff ?? null,
    error: current?.error ?? null,
    retry: () => setAttempt((a) => a + 1),
  };
}
