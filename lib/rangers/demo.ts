import type { PendingReport } from "@/types/rangers/report";
import type { SyncProgress, SyncSummary } from "@/services/rangers/reports";
import type { UserProfile } from "@/types/rangers/auth";
import { OfflineError } from "@/lib/rangers/api";
import { deleteReport } from "@/lib/rangers/reports-db";

// DEMO MODE: lets the jury try the whole rangers module without a deployed backend.
// It is on when NEXT_PUBLIC_RANGERS_DEMO=true, or when NEXT_PUBLIC_API_URL is empty at build time.
// Everything stays in the browser: login is checked against the demo credentials below and
// "Sincronizar" simulates the upload (with progress) and then clears the reports from the phone.
export const DEMO_MODE =
  process.env.NEXT_PUBLIC_RANGERS_DEMO === "true" || !process.env.NEXT_PUBLIC_API_URL;

export const DEMO_CREDENTIALS = { email: "guardaparque@ibera.demo", password: "Ibera2026" };

export const DEMO_USER: UserProfile = {
  id: "00000000-0000-4000-8000-000000000001",
  name: "Juan",
  lastName: "Pérez",
  email: DEMO_CREDENTIALS.email,
  portal: "CarlosPellegrini",
  role: "Ranger",
};

/** Laguna Iberá (Colonia Carlos Pellegrini): used when the browser does not give a GPS position in demo mode. */
export const DEMO_POSITION = { latitude: -28.5367, longitude: -57.1772, accuracy: 25 };

/** Sample photo from the landing (public/img) so the flow can be tried on a computer without a camera. */
export const DEMO_PHOTO_URL = "/img/plastic-pollution.webp";

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

export async function demoLogin(email: string, password: string) {
  await wait(600);
  if (email.trim().toLowerCase() !== DEMO_CREDENTIALS.email || password !== DEMO_CREDENTIALS.password) {
    throw new Error("Email o contraseña incorrectos. Usá los datos de prueba que aparecen arriba.");
  }
  return { token: "demo-token", expiresAt: new Date(Date.now() + 12 * 3600_000).toISOString(), user: DEMO_USER };
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
  for (const r of sendable) await deleteReport(r.clientId);

  return { sent: sendable.length, photosPending: 0, withoutLocation: reports.length - sendable.length };
}
