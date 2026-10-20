"use client";

import { useEffect, useMemo, useState } from "react";
import { CategoryForm } from "@/components/admin/categories/CategoryForm";
import { CategoryList } from "@/components/admin/categories/CategoryList";
import { PageHeader } from "@/components/admin/ui/PageHeader";
import { BigButton } from "@/components/rangers/ui/BigButton";
import { ErrorBox } from "@/components/rangers/ui/ErrorBox";
import { Spinner } from "@/components/rangers/ui/Spinner";
import { ApiError, OfflineError } from "@/lib/api/client";
import { SEVERITY } from "@/lib/admin/labels";
import { getCategories } from "@/services/admin/categories";
import { getReports } from "@/services/admin/reports";
import type { ReportCategory, ReportResponse } from "@/types/admin/report";

/** Most serious first; same severity by name */
const bySeverity = (a: ReportCategory, b: ReportCategory) =>
  SEVERITY[b.severityLevel].rank - SEVERITY[a.severityLevel].rank || a.name.localeCompare(b.name, "es");

function countByCategory(reports: ReportResponse[]) {
  const counts: Record<string, number> = {};
  for (const r of reports) counts[r.reportCategoryId] = (counts[r.reportCategoryId] ?? 0) + 1;
  return counts;
}

function loadErrorMessage(err: unknown) {
  if (err instanceof OfflineError) return "No hay conexión con el servidor. Probá de nuevo en unos minutos.";
  if (err instanceof ApiError) return err.message;
  return "No pudimos cargar las categorías. Probá de nuevo.";
}

/** /admin/categorias: the categories the reports are filed under, and the form to add one. */
export function CategoriesView() {
  const [categories, setCategories] = useState<ReportCategory[] | null>(null);
  const [counts, setCounts] = useState<Record<string, number> | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);
  const [createdId, setCreatedId] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    getCategories()
      .then((list) => {
        if (active) setCategories(list);
      })
      .catch((err) => {
        if (active) setLoadError(loadErrorMessage(err));
      });
    // Extra: how many reports each category has. If counting fails, the list still shows without it.
    getReports()
      .then((reports) => {
        if (active) setCounts(countByCategory(reports));
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [attempt]);

  const sorted = useMemo(() => (categories ? [...categories].sort(bySeverity) : null), [categories]);

  const retry = () => {
    setLoadError(null);
    setAttempt((n) => n + 1);
  };

  const onCreated = (category: ReportCategory) => {
    setCategories((list) => (list ? [...list, category] : list));
    setCreatedId(category.id);
  };

  return (
    <>
      <PageHeader
        title="Categorías"
        description="Con estas categorías se clasifican los reportes. Se pueden crear nuevas, pero no editarlas ni borrarlas."
      />

      <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_400px]">
        <section aria-labelledby="categories-title" className="flex min-w-0 flex-col gap-4">
          <h2 id="categories-title" className="eyebrow m-0 text-mute">
            {sorted ? `${sorted.length} ${sorted.length === 1 ? "categoría" : "categorías"} · de mayor a menor gravedad` : "Categorías"}
          </h2>
          {loadError ? (
            <div className="flex flex-col gap-4">
              <ErrorBox message={loadError} />
              <BigButton variant="neutral" icon="🔄" onClick={retry}>
                Probar de nuevo
              </BigButton>
            </div>
          ) : sorted ? (
            <CategoryList categories={sorted} counts={counts} highlightId={createdId} />
          ) : (
            <Spinner label="Cargando las categorías…" />
          )}
        </section>

        <CategoryForm onCreated={onCreated} />
      </div>
    </>
  );
}
