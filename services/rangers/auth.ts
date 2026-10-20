import { rangerApi as apiFetch, sessionStore } from "@/lib/rangers/session";
import { DEMO_MODE, demoLogin } from "@/lib/rangers/demo";
import { isAdmin, startAdminSession } from "@/services/admin/auth";
import type { LoginResponse, UserProfile } from "@/types/rangers/auth";

/** Where a user works: admins in the panel, rangers and helpers in the field app. */
export type AuthModule = "rangers" | "admin";

export const MODULE_HOME: Record<AuthModule, string> = { rangers: "/rangers", admin: "/admin" };

/**
 * One login (same endpoint, same demo accounts) for /rangers and /admin. The role decides which module's
 * session is kept, and the caller sends the user there if it is not the module they logged in from.
 */
export async function login(email: string, password: string): Promise<{ user: UserProfile; module: AuthModule }> {
  const res = DEMO_MODE
    ? await demoLogin(email, password)
    : await apiFetch<LoginResponse>("/api/auth/login", {
        method: "POST",
        auth: false,
        json: { email: email.trim(), password },
      });
  if (isAdmin(res.user)) {
    startAdminSession(res);
    return { user: res.user, module: "admin" };
  }
  sessionStore.write({ token: res.token, expiresAt: res.expiresAt, user: res.user });
  return { user: res.user, module: "rangers" };
}
