"use client";

import { useState, type FormEvent } from "react";
import { BigButton } from "@/components/rangers/ui/BigButton";
import { ErrorBox } from "@/components/rangers/ui/ErrorBox";
import { Screen } from "@/components/rangers/ui/Screen";
import { TextField } from "@/components/rangers/ui/TextField";
import { ApiError, OfflineError } from "@/lib/rangers/api";
import { login } from "@/services/rangers/auth";

type Props = {
  /** Shown when the session expired and the ranger has to log in again to send reports */
  reason?: string;
  /** Pre-filled email (session expired: we already know who it is) */
  defaultEmail?: string;
  onCancel?: () => void;
};

/**
 * The only screen where the ranger has to type, and only once (with signal, before going out).
 * After that the session stays on the phone for the whole day.
 */
export function LoginView({ reason, defaultEmail = "", onCancel }: Props) {
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
      await login(email, password);
    } catch (err) {
      if (err instanceof OfflineError) setError("No hay señal. Para entrar la primera vez necesitás conexión.");
      else if (err instanceof ApiError) setError(err.message);
      else setError("No pudimos entrar. Probá de nuevo.");
      setLoading(false);
    }
  };

  return (
    <Screen title="Ingresar" onBack={onCancel}>
      {reason ? (
        <p role="status" className="rounded-[12px] border border-sky bg-sky/10 p-4 text-[17px] font-semibold text-sky">
          {reason}
        </p>
      ) : (
        <p className="text-[17px]">Entrá con tu usuario para empezar a reportar.</p>
      )}

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
    </Screen>
  );
}
