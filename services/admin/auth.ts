import { adminSessionStore } from "@/lib/admin/session";
import type { LoginResponse, UserProfile } from "@/types/rangers/auth";

/** Only admins open the panel (backend policy "Admin"); rangers and helpers use the field app. */
export const isAdmin = (user: UserProfile) => user.role === "Admin";

/** Keeps the admin's session under "admin:session", apart from the ranger's: logging out of one never closes the other. */
export function startAdminSession(res: LoginResponse) {
  adminSessionStore.write({ token: res.token, expiresAt: res.expiresAt, user: res.user });
}
