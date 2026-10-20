"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { DemoAccounts } from "@/components/auth/DemoAccounts";
import { BigButton } from "@/components/rangers/ui/BigButton";
import { ErrorBox } from "@/components/rangers/ui/ErrorBox";
import { TextField } from "@/components/rangers/ui/TextField";
import { ApiError, OfflineError } from "@/lib/api/client";
import { DEMO_MODE } from "@/lib/rangers/demo";
import { login, MODULE_HOME, type AuthModule } from "@/services/rangers/auth";

const INTRO: Record<AuthModule, string> = {
  rangers: "Entrá con tu usuario para empezar a reportar.",
  admin: "Entrá con tu usuario de administrador para ver y gestionar los reportes de los guardaparques.",
};

const OFFLINE: Record<AuthModule, string> = {
  rangers: "No hay señal. Para entrar la primera vez necesitás conexión.",
  admin: "No hay conexión con el servidor. Probá de nuevo en unos minutos.",
};

type Props = {
  /** Module whose screen shows the form. An account of the other module is sent there after logging in. */
  module: AuthModule;
  /** Shown when the session expired and the user has to log in again */
  reason?: string;
  /** Pre-filled email (session expired: we already know who it is) */
  defaultEmail?: string;
};

/** Login shared by /rangers and /admin: same accounts, and the role decides which module opens. */
export function LoginForm({ module, reason, defaultEmail = "" }: Props) {
  const router = useRouter();
  const [email, setEmail] = useState(defaultEmail);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      setError("Escribí tu email y tu contraseña.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const { module: home } = await login(email, password);
      // Same module: the new session re-renders the app right here. Other module: its session is saved, go there.
      if (home !== module) router.replace(MODULE_HOME[home]);
    } catch (err) {
      if (err instanceof OfflineError) setError(OFFLINE[module]);
      else if (err instanceof ApiError) setError(err.message);
      else if (DEMO_MODE && err instanceof Error) setError(err.message);
      else setError("No pudimos entrar. Probá de nuevo.");
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {reason ? (
        <p role="status" className="m-0 rounded-[12px] border border-sky bg-sky/10 p-4 text-[17px] font-semibold text-sky">
          {reason}
        </p>
      ) : (
        <p className="m-0 text-[17px]">{INTRO[module]}</p>
      )}

      {DEMO_MODE && !reason ? (
        <DemoAccounts
          module={module}
          onPick={(credentials) => {
            setEmail(credentials.email);
            setPassword(credentials.password);
            setError(null);
          }}
        />
      ) : null}

      <form onSubmit={submit} className="flex flex-col gap-6" noValidate>
        <TextField
          label="Email"
          type="email"
          inputMode="email"
          autoComplete="username"
          autoCapitalize="none"
          spellCheck={false}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <div className="flex flex-col gap-3">
          <TextField
            label="Contraseña"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            aria-pressed={showPassword}
            className="min-h-14 self-start rounded-[10px] border border-rule px-4 text-[15px] font-semibold active:bg-page-2"
          >
            <span aria-hidden="true">{showPassword ? "🙈 " : "👁️ "}</span>
            {showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
          </button>
        </div>

        <ErrorBox message={error} />

        <BigButton type="submit" icon="🔑" disabled={loading} aria-busy={loading}>
          {loading ? "Entrando…" : "Entrar"}
        </BigButton>
      </form>
    </div>
  );
}
