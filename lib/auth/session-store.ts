import { createApiClient } from "@/lib/api/client";
import { createLocalStore } from "@/lib/storage/local-store";
import type { Session } from "@/types/rangers/auth";

/** Token still usable? (with one minute of margin) */
export function hasValidToken(session: Session | null): boolean {
  if (!session?.token || !session.expiresAt) return false;
  return new Date(session.expiresAt).getTime() - 60_000 > Date.now();
}

/**
 * One session per module, each under its own localStorage key ("ranger:session", "admin:session"),
 * with its own API client. Logging out of one module never touches the other.
 */
export function createSessionStore(key: string) {
  const store = createLocalStore<Session | null>(key, null);

  /** Keeps the profile (greeting, offline work) but forgets the token: the next request asks to log in again. */
  const expireToken = () => {
    const current = store.read();
    if (current?.token) store.write({ ...current, token: null, expiresAt: null });
  };

  const clearSession = () => store.write(null);

  const api = createApiClient({
    getToken: () => {
      const session = store.read();
      return hasValidToken(session) ? session!.token : null;
    },
    onUnauthorized: expireToken,
  });

  return { store, expireToken, clearSession, api };
}
