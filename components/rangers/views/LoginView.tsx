"use client";

import { LoginForm } from "@/components/auth/LoginForm";
import { Screen } from "@/components/rangers/ui/Screen";

type Props = {
  /** Shown when the session expired and the ranger has to log in again to send reports */
  reason?: string;
  /** Pre-filled email (session expired: we already know who it is) */
  defaultEmail?: string;
  onCancel?: () => void;
};

/**
 * The only screen where the ranger has to type, and only once (with signal, before going out).
 * After that the session stays on the phone for the whole day. An admin account logging in here goes to /admin.
 */
export function LoginView({ reason, defaultEmail, onCancel }: Props) {
  return (
    <Screen title="Ingresar" onBack={onCancel}>
      <LoginForm module="rangers" reason={reason} defaultEmail={defaultEmail} />
    </Screen>
  );
}
