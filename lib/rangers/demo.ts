import type { PendingReport } from "@/types/rangers/report";
import type { SyncProgress, SyncSummary } from "@/services/rangers/reports";
import type { LoginResponse, UserProfile } from "@/types/rangers/auth";
import { OfflineError } from "@/lib/api/client";
import { deleteReport } from "@/lib/rangers/reports-db";
import { sessionStore } from "@/lib/rangers/session";
import { addSyncedReports } from "@/lib/demo-server";

// DEMO MODE: lets the jury try the rangers module and the admin panel without a deployed backend.
// It is on when NEXT_PUBLIC_RANGERS_DEMO=true, or when NEXT_PUBLIC_API_URL is empty at build time.
// Everything stays in the browser: login is checked against the demo accounts below and
// "Sincronizar" simulates the upload (with progress), hands the reports to the demo server (lib/demo-server,
// where /admin reads them) and then clears them from the phone.
export const DEMO_MODE =
  process.env.NEXT_PUBLIC_RANGERS_DEMO === "true" || !process.env.NEXT_PUBLIC_API_URL;

export const DEMO_CREDENTIALS = { email: "guardaparque@ibera.demo", password: "Ibera2026" };
export const DEMO_ADMIN_CREDENTIALS = { email: "admin@ibera.demo", password: "Ibera2026" };

export const DEMO_USER: UserProfile = {
  id: "00000000-0000-4000-8000-000000000001",
  name: "Juan",
  lastName: "Pérez",
  email: DEMO_CREDENTIALS.email,
  portal: "CarlosPellegrini",
  role: "Ranger",
};

/** Same id as the admin seeded by the demo server (lib/demo-server). */
export const DEMO_ADMIN: UserProfile = {
  id: "00000000-0000-4000-8000-000000000002",
  name: "Ana",
  lastName: "Gómez",
  email: DEMO_ADMIN_CREDENTIALS.email,
  portal: "CarlosPellegrini",
  role: "Admin",
};

/** Both demo accounts: the role decides which module each one opens (/rangers or /admin). */
const DEMO_ACCOUNTS = [
  { ...DEMO_CREDENTIALS, user: DEMO_USER },
  { ...DEMO_ADMIN_CREDENTIALS, user: DEMO_ADMIN },
];

/** Laguna Iberá (Colonia Carlos Pellegrini): used when the browser does not give a GPS position in demo mode. */
export const DEMO_POSITION = { latitude: -28.5367, longitude: -57.1772, accuracy: 25 };

/** Sample photo from the landing (public/img) so the flow can be tried on a computer without a camera. */
export const DEMO_PHOTO_URL = "/img/plastic-pollution.webp";

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

export async function demoLogin(email: string, password: string): Promise<LoginResponse> {
  await wait(600);
  const account = DEMO_ACCOUNTS.find((a) => a.email === email.trim().toLowerCase() && a.password === password);
  if (!account) {
    throw new Error("Email o contraseña incorrectos. Usá los datos de prueba que aparecen arriba.");
  }
  return { token: "demo-token", expiresAt: new Date(Date.now() + 12 * 3600_000).toISOString(), user: account.user };
}

export async function demoSync(reports: PendingReport[], onProgress: (p: SyncProgress) => void): Promise<SyncSummary> {
  // Respect the browser offline switch, so the "sin señal" behaviour can be tried too (DevTools → Network → Offline)
  if (!navigator.onLine) throw new OfflineError();

  const sendable = reports.filter((r) => r.latitude !== null && r.longitude !== null);
  onProgress({ step: "data", done: 0, total: sendable.length });
  await wait(900);

  const withPhoto = sendable.filter((r) => r.photo);
  for (let i = 0; i < withPhoto.length; i++) {
    onProgress({ step: "photos", done: i, total: withPhoto.length });
    await wait(500);
  }

  // The reports leave the phone only once the demo server has them (idempotent by clientId, like /api/reports/sync)
  const reportedById = sessionStore.read()?.user.id ?? DEMO_USER.id;
  await addSyncedReports(
    sendable.map((r) => ({
      clientId: r.clientId,
      latitude: r.latitude!,
      longitude: r.longitude!,
      notes: r.notes || null,
      captureDate: r.captureDate,
      reportCategoryId: r.categoryId,
      reportedById,
      photo: r.photo,
    })),
  );
  for (const r of sendable) await deleteReport(r.clientId);

  return { sent: sendable.length, photosPending: 0, withoutLocation: reports.length - sendable.length };
}
