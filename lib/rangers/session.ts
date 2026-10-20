import { createSessionStore } from "@/lib/auth/session-store";

export { hasValidToken } from "@/lib/auth/session-store";

// The session lives in localStorage so the ranger logs in ONCE (with signal) and can keep working
// for the whole day in the field. The token lasts 12 h (backend Jwt:DurationInMinutes).
const ranger = createSessionStore("ranger:session");

export const sessionStore = ranger.store;
/** Keeps the profile (greeting, offline work) but forgets the token: the next sync asks to log in again. */
export const expireToken = ranger.expireToken;
export const clearSession = ranger.clearSession;
/** API client authenticated with the ranger's token */
export const rangerApi = ranger.api;
