import { createSessionStore } from "@/lib/auth/session-store";

// Admin panel session, separate from the ranger's ("ranger:session"): both can be open in the same browser.
const admin = createSessionStore("admin:session");

export const adminSessionStore = admin.store;
export const expireAdminToken = admin.expireToken;
export const clearAdminSession = admin.clearSession;
/** API client authenticated with the admin's token */
export const adminApi = admin.api;
