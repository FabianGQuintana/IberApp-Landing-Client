import { ApiError, OfflineError } from "@/lib/api/client";
import { newId } from "@/lib/rangers/id";
import type {
  CreateReportCategory,
  ReportCategory,
  ReportFilter,
  ReportResponse,
  ReportStatus,
  SeverityLevel,
  StaffMember,
} from "@/types/admin/report";
import { STORES, inTransaction, openDb, read, type StoredCategory, type StoredReport, type StoredUser } from "./db";
import { SEED_CATEGORIES, SEED_USERS, seedReports } from "./seed";

// DEMO SERVER: plays the IberaReclamos API in the browser, for /admin (services/admin/*) and for what
// /rangers syncs. It answers like the backend (ReportRepository, ReportService, ReportCategoryService):
// same filters, order, resolved names and error messages, with a simulated network delay.
// It must not import lib/rangers/demo: that module feeds this one (addSyncedReports).

const LATENCY_MS = 400;
const SEVERITIES: SeverityLevel[] = ["Low", "Moderate", "High", "Critical", "Emergency"];

const db = () => openDb(writeSeed);

function writeSeed(tx: IDBTransaction) {
  const data: Record<(typeof STORES)[number], object[]> = {
    reports: seedReports(),
    categories: SEED_CATEGORIES,
    users: SEED_USERS,
  };
  for (const name of STORES) {
    const store = tx.objectStore(name);
    store.clear();
    for (const item of data[name]) store.put(item);
  }
}

/** Like apiFetch: respects the browser offline switch, then waits as a request would. */
async function network() {
  if (typeof navigator !== "undefined" && !navigator.onLine) throw new OfflineError();
  await new Promise((r) => setTimeout(r, LATENCY_MS));
}

const notFound = () => new ApiError(404, "NOT_FOUND", "El reporte no existe.");
const invalid = (message: string) => new ApiError(400, "VALIDATION_FAILED", message);

// One object URL per synced photo: it lives until the page is closed or the demo is reset
const photoUrls = new Map<string, string>();

function photoUrl(report: StoredReport) {
  if (!report.photo) return null;
  if (typeof report.photo === "string") return report.photo;
  let url = photoUrls.get(report.id);
  if (!url) {
    url = URL.createObjectURL(report.photo);
    photoUrls.set(report.id, url);
  }
  return url;
}

/** ReportMapper.ToDto: category and reporter names come from their ids ("" if missing, like the backend) */
function toResponse(report: StoredReport, categories: Map<string, StoredCategory>, users: Map<string, StoredUser>): ReportResponse {
  const category = categories.get(report.reportCategoryId);
  const user = users.get(report.reportedById);
  return {
    id: report.id,
    clientId: report.clientId,
    latitude: report.latitude,
    longitude: report.longitude,
    notes: report.notes,
    captureDate: report.captureDate,
    syncDate: report.syncDate,
    status: report.status,
    photoUrl: photoUrl(report),
    reportCategoryId: report.reportCategoryId,
    category: category?.name ?? "",
    severityLevel: category?.severityLevel ?? ("" as SeverityLevel),
    reportedById: report.reportedById,
    reportedBy: user ? `${user.name} ${user.lastName}` : "",
  };
}

async function lookups(tx: IDBTransaction) {
  const [categories, users] = await Promise.all([
    read<StoredCategory[]>(tx.objectStore("categories").getAll()),
    read<StoredUser[]>(tx.objectStore("users").getAll()),
  ]);
  return { categories: new Map(categories.map((c) => [c.id, c])), users: new Map(users.map((u) => [u.id, u])) };
}

const time = (iso: string | undefined) => (iso ? Date.parse(iso) : NaN);

/** Endpoints of the demo server, called by the DEMO_MODE branch of services/admin/*. */
export const demoServer = {
  /** GET /api/reports: every filter optional, from/to inclusive on captureDate, newest first */
  async getReports(filter: ReportFilter = {}): Promise<ReportResponse[]> {
    await network();
    const from = time(filter.from);
    const to = time(filter.to);
    return inTransaction(await db(), [...STORES], "readonly", async (tx) => {
      const [reports, { categories, users }] = await Promise.all([
        read<StoredReport[]>(tx.objectStore("reports").getAll()),
        lookups(tx),
      ]);
      return reports
        .filter(
          (r) =>
            (!filter.status || r.status === filter.status) &&
            (!filter.categoryId || r.reportCategoryId === filter.categoryId) &&
            (!filter.reportedById || r.reportedById === filter.reportedById) &&
            (Number.isNaN(from) || time(r.captureDate) >= from) &&
            (Number.isNaN(to) || time(r.captureDate) <= to),
        )
        .sort((a, b) => time(b.captureDate) - time(a.captureDate))
        .map((r) => toResponse(r, categories, users));
    });
  },

  /** GET /api/reports/{id} */
  async getReport(id: string): Promise<ReportResponse> {
    await network();
    return inTransaction(await db(), [...STORES], "readonly", async (tx) => {
      const report = await read<StoredReport | undefined>(tx.objectStore("reports").get(id));
      if (!report) throw notFound();
      const { categories, users } = await lookups(tx);
      return toResponse(report, categories, users);
    });
  },

  /** PATCH /api/reports/{id}/status: any transition is allowed (ReportService.UpdateStatusAsync) */
  async updateReportStatus(id: string, status: ReportStatus): Promise<ReportResponse> {
    await network();
    return inTransaction(await db(), [...STORES], "readwrite", async (tx) => {
      const reports = tx.objectStore("reports");
      const report = await read<StoredReport | undefined>(reports.get(id));
      if (!report) throw notFound();
      const updated = { ...report, status };
      await read(reports.put(updated));
      const { categories, users } = await lookups(tx);
      return toResponse(updated, categories, users);
    });
  },

  /** GET /api/report-categories, by name */
  async getCategories(): Promise<ReportCategory[]> {
    await network();
    const categories = await inTransaction(await db(), ["categories"], "readonly", (tx) =>
      read<StoredCategory[]>(tx.objectStore("categories").getAll()),
    );
    return categories.sort((a, b) => a.name.localeCompare(b.name, "es"));
  },

  /** POST /api/report-categories, with CreateReportCategoryValidator's rules and the unique name */
  async createCategory(input: CreateReportCategory): Promise<ReportCategory> {
    await network();
    const name = input.name.trim();
    const description = input.description?.trim() || null;
    if (!name) throw invalid("El nombre de la categoría es obligatorio.");
    if (name.length > 100) throw invalid("El nombre no puede superar los 100 caracteres.");
    if (description && description.length > 500) throw invalid("La descripción no puede superar los 500 caracteres.");
    if (!SEVERITIES.includes(input.severityLevel)) throw invalid("El nivel de gravedad no es válido.");

    return inTransaction(await db(), ["categories"], "readwrite", async (tx) => {
      const store = tx.objectStore("categories");
      const existing = await read<StoredCategory[]>(store.getAll());
      if (existing.some((c) => c.name.toLowerCase() === name.toLowerCase())) {
        throw new ApiError(409, "CONFLICT", "Ya existe una categoría con ese nombre.");
      }
      const category: StoredCategory = { id: newId(), name, description, severityLevel: input.severityLevel };
      await read(store.put(category));
      return category;
    });
  },

  /** GET /api/users: every role, by last name and name */
  async getUsers(): Promise<StaffMember[]> {
    await network();
    const users = await inTransaction(await db(), ["users"], "readonly", (tx) =>
      read<StoredUser[]>(tx.objectStore("users").getAll()),
    );
    return users.sort((a, b) => a.lastName.localeCompare(b.lastName, "es") || a.name.localeCompare(b.name, "es"));
  },
};

/** Back to the initial data: drops synced reports, status changes and new categories. */
export async function resetDemoServer(): Promise<void> {
  await inTransaction(await db(), [...STORES], "readwrite", async (tx) => writeSeed(tx));
  photoUrls.forEach((url) => URL.revokeObjectURL(url));
  photoUrls.clear();
}

/** What /rangers sends when it syncs (the data plus its photo, in one step) */
export type SyncedReportInput = {
  clientId: string;
  latitude: number;
  longitude: number;
  notes: string | null;
  captureDate: string;
  reportCategoryId: string;
  reportedById: string;
  photo: Blob | null;
};

/**
 * Entry point for the ranger's sync (ReportService.SyncAsync): new reports arrive as Pending.
 * Idempotent by clientId: a report sent twice is kept once, as it arrived the first time.
 */
export async function addSyncedReports(items: SyncedReportInput[]): Promise<void> {
  if (items.length === 0) return;
  const syncDate = new Date().toISOString();
  await inTransaction(await db(), ["reports", "categories"], "readwrite", async (tx) => {
    const store = tx.objectStore("reports");
    const [existing, categories] = await Promise.all([
      read<StoredReport[]>(store.getAll()),
      read<IDBValidKey[]>(tx.objectStore("categories").getAllKeys()),
    ]);
    // Like EnsureCategoriesExistAsync: one unknown category rejects the whole batch
    const missing = items.find((item) => !categories.includes(item.reportCategoryId));
    if (missing) throw invalid(`La categoría ${missing.reportCategoryId} no existe.`);

    const known = new Set(existing.map((r) => r.clientId));
    for (const item of items) {
      if (known.has(item.clientId)) continue;
      known.add(item.clientId);
      const report: StoredReport = {
        id: newId(),
        clientId: item.clientId,
        latitude: item.latitude,
        longitude: item.longitude,
        notes: item.notes?.trim() || null,
        captureDate: new Date(item.captureDate).toISOString(),
        syncDate,
        status: "Pending",
        photo: item.photo,
        reportCategoryId: item.reportCategoryId,
        reportedById: item.reportedById,
      };
      store.put(report);
    }
  });
}
