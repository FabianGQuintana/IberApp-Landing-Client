import { apiFetch } from "@/lib/rangers/api";
import { sessionStore } from "@/lib/rangers/session";
import { DEMO_MODE, demoLogin } from "@/lib/rangers/demo";
import type { LoginResponse } from "@/types/rangers/auth";

export async function login(email: string, password: string) {
  const res = DEMO_MODE
    ? await demoLogin(email, password)
    : await apiFetch<LoginResponse>("/api/auth/login", {
        method: "POST",
        auth: false,
        json: { email: email.trim(), password },
      });
  sessionStore.write({ token: res.token, expiresAt: res.expiresAt, user: res.user });
  return res.user;
}
