import { DEMO_MODE, demoSync } from "@/lib/rangers/demo";
import { ApiError, apiFetch } from "@/lib/rangers/api";
import { deleteReport, saveReport } from "@/lib/rangers/reports-db";
import type { PendingReport, SyncReportsRequest, SyncReportsResult } from "@/types/rangers/report";

/** Same limit as the backend (SyncReportsValidator.MaxReportsPerSync). */
const MAX_PER_SYNC = 200;

export type SyncProgress = { step: "data" | "photos"; done: number; total: number };

export type SyncSummary = {
  /** Reports that are now on the server (data and photo) */
  sent: number;
  /** Reports whose data arrived but the photo did not: retried on the next sync */
  photosPending: number;
  /** Reports without GPS position: the backend cannot accept them */
  withoutLocation: number;
};

export const hasLocation = (r: PendingReport) => r.latitude !== null && r.longitude !== null;

/**
 * Sends everything saved on the phone, in two phases:
 * 1. Bulk insert of the data (POST /api/reports/sync). It is idempotent by clientId, so if the signal
 *    drops halfway and the ranger tries again, nothing is duplicated.
 * 2. One upload per photo (POST /api/reports/{id}/photo). A report leaves the phone only when
 *    its photo arrived too.
 * Connection or session errors stop the process: what was already sent is removed from the phone
 * and the rest stays for the next try.
 */
export async function syncReports(reports: PendingReport[], onProgress: (p: SyncProgress) => void): Promise<SyncSummary> {
  if (DEMO_MODE) return demoSync(reports, onProgress);

  const withoutLocation = reports.filter((r) => !hasLocation(r) && !r.serverId).length;
  let sent = 0;

  // 1. Data (only the ones the server does not have yet)
  const toSend = reports.filter((r) => hasLocation(r) && !r.serverId);
  const waitingPhoto = reports.filter((r) => r.serverId && r.photo);

  for (let i = 0; i < toSend.length; i += MAX_PER_SYNC) {
    const batch = toSend.slice(i, i + MAX_PER_SYNC);
    onProgress({ step: "data", done: i, total: toSend.length });

    const body: SyncReportsRequest = {
      reports: batch.map((r) => ({
        clientId: r.clientId,
        latitude: r.latitude!,
        longitude: r.longitude!,
        notes: r.notes || undefined,
        captureDate: r.captureDate,
        reportCategoryId: r.categoryId,
      })),
    };
    const result = await apiFetch<SyncReportsResult>("/api/reports/sync", { method: "POST", json: body });

    const serverIds = new Map(result.items.map((item) => [item.clientId, item.reportId]));
    for (const report of batch) {
      const serverId = serverIds.get(report.clientId);
      if (!serverId) continue;
      if (report.photo) {
        // Remember the server id so a failed photo upload never resends the data
        const updated = { ...report, serverId };
        await saveReport(updated);
        waitingPhoto.push(updated);
      } else {
        await deleteReport(report.clientId);
        sent++;
      }
    }
  }

  // 2. Photos, one by one (a weak signal handles small requests better than one huge request)
  let photosPending = 0;
  for (let i = 0; i < waitingPhoto.length; i++) {
    const report = waitingPhoto[i];
    onProgress({ step: "photos", done: i, total: waitingPhoto.length });

    const form = new FormData();
    form.append("photo", report.photo!, `${report.clientId}.jpg`);
    try {
      await apiFetch(`/api/reports/${report.serverId}/photo`, { method: "POST", body: form });
      await deleteReport(report.clientId);
      sent++;
    } catch (err) {
      // A problem with this photo only (e.g. the server rejected the file): skip it, keep it on the phone
      if (err instanceof ApiError && err.status >= 400 && err.status < 500 && ![401, 403, 429].includes(err.status)) {
        photosPending++;
        continue;
      }
      throw err; // no signal / session expired / server down: stop here
    }
  }

  return { sent, photosPending, withoutLocation };
}
