import { configureApi } from "@/lib/rangers/api";
import { createLocalStore } from "@/lib/storage/local-store";
import type { Session } from "@/types/rangers/auth";

// The session lives in localStorage so the ranger logs in ONCE (with signal) and can keep working
// for the whole day in the field. The token lasts 12 h (backend Jwt:DurationInMinutes).
export const sessionStore = createLocalStore<Session | null>("ranger:session", null);

/** Token still usable? (with one minute of margin) */
export function hasValidToken(session: Session | null): boolean {
  if (!session?.token || !session.expiresAt) return false;
  return new Date(session.expiresAt).getTime() - 60_000 > Date.now();
}

/** Keeps the profile (greeting, offline work) but forgets the token: the next sync asks to log in again. */
export function expireToken() {
  const current = sessionStore.read();
  if (current?.token) sessionStore.write({ ...current, token: null, expiresAt: null });
}

export function clearSession() {
  sessionStore.write(null);
}

configureApi({
  getToken: () => {
    const session = sessionStore.read();
    return hasValidToken(session) ? session!.token : null;
  },
  onUnauthorized: expireToken,
});
