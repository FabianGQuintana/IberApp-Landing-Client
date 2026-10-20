import { DEMO_MODE } from "@/lib/rangers/demo";
import { adminApi as apiFetch } from "@/lib/admin/session";
import { demoServer } from "@/lib/demo-server";
import type { CreateReportCategory, ReportCategory } from "@/types/admin/report";

/** Every category, by name. */
export async function getCategories(): Promise<ReportCategory[]> {
  if (DEMO_MODE) return demoServer.getCategories();
  return apiFetch<ReportCategory[]>("/api/report-categories");
}

/** Admin only. A repeated name answers ApiError(409, "CONFLICT", "Ya existe una categoría con ese nombre."). */
export async function createCategory(input: CreateReportCategory): Promise<ReportCategory> {
  if (DEMO_MODE) return demoServer.createCategory(input);
  return apiFetch<ReportCategory>("/api/report-categories", { method: "POST", json: input });
}
