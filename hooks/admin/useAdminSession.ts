"use client";

import { useSyncExternalStore } from "react";
import { adminSessionStore } from "@/lib/admin/session";
import { hasValidToken } from "@/lib/auth/session-store";

export function useAdminSession() {
  const session = useSyncExternalStore(adminSessionStore.subscribe, adminSessionStore.read, adminSessionStore.serverSnapshot);
  return { session, tokenValid: hasValidToken(session) };
}
