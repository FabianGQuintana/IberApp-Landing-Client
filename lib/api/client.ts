// Small fetch wrapper for the IberaReclamos API.
// Requests go to "/api/..." on this same origin; next.config.ts forwards them to the backend.
// Each module (rangers, admin) creates its own client bound to its own session, so their tokens never mix.

/** No signal, or the server could not be reached. The data stays on the phone. */
export class OfflineError extends Error {
  constructor() {
    super("Sin conexión con el servidor.");
  }
}

/** The server answered with an error (body follows the backend's ApiErrorResponse). */
export class ApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: string,
    message: string,
  ) {
    super(message);
  }
}

export type ApiOptions = Omit<RequestInit, "body"> & { json?: unknown; body?: BodyInit; auth?: boolean };

export type ApiFetch = <T>(path: string, options?: ApiOptions) => Promise<T>;

type ClientOptions = {
  /** Current token, or null when there is none (or it expired) */
  getToken: () => string | null;
  /** Called on a 401 from an authenticated request */
  onUnauthorized: () => void;
};

export function createApiClient({ getToken, onUnauthorized }: ClientOptions): ApiFetch {
  return async function apiFetch<T>(path: string, { json, auth = true, headers, ...init }: ApiOptions = {}): Promise<T> {
    if (typeof navigator !== "undefined" && !navigator.onLine) throw new OfflineError();

    const finalHeaders = new Headers(headers);
    finalHeaders.set("Accept", "application/json");
    if (json !== undefined) finalHeaders.set("Content-Type", "application/json");

    const token = auth ? getToken() : null;
    if (token) finalHeaders.set("Authorization", `Bearer ${token}`);

    let res: Response;
    try {
      res = await fetch(path, {
        ...init,
        headers: finalHeaders,
        body: json !== undefined ? JSON.stringify(json) : init.body,
      });
    } catch {
      throw new OfflineError(); // network failure: same as no signal
    }

    // The rewrite answers 5xx when the backend is down: treat it like no signal, nothing is lost.
    if (res.status === 502 || res.status === 503 || res.status === 504) throw new OfflineError();

    if (!res.ok) {
      const data = (await res.json().catch(() => null)) as { code?: string; message?: string } | null;
      // A 5xx without our JSON error body comes from the Next proxy (backend unreachable), not from the API
      if (res.status >= 500 && !data?.code) throw new OfflineError();
      if (res.status === 401 && auth) onUnauthorized();
      throw new ApiError(res.status, data?.code ?? "ERROR", data?.message ?? defaultMessage(res.status));
    }

    if (res.status === 204) return undefined as T;
    return (await res.json()) as T;
  };
}

function defaultMessage(status: number) {
  if (status === 401) return "Tu sesión venció. Volvé a entrar.";
  if (status === 403) return "Tu usuario no tiene permiso para esto.";
  if (status === 413) return "La foto es demasiado grande.";
  if (status === 429) return "Demasiados intentos. Esperá un minuto.";
  return "El servidor tuvo un problema. Probá de nuevo en unos minutos.";
}
