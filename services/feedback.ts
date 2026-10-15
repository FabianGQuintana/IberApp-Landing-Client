import { createLocalStore } from "@/lib/storage/local-store";
import type { FeedbackInput, FeedbackResult, QueuedFeedback } from "@/types/feedback";

// Endpoint of the IberaReclamos backend. Without NEXT_PUBLIC_API_URL the form works in demo mode (nothing leaves the device).
const API_URL = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "");
export const FEEDBACK_ENDPOINT = "/api/feedback";

/** Valuations saved without signal; sent when the connection comes back (useFeedbackQueue). */
export const feedbackQueue = createLocalStore<QueuedFeedback[]>("ibera:feedback-queue", []);

class OfflineError extends Error {}

const newCode = () => `IB-V${Math.floor(1000 + Math.random() * 9000)}`;

async function dataUrlToBlob(dataUrl: string) {
  return (await fetch(dataUrl)).blob();
}

/** Sends one valuation. Throws OfflineError when there is no connection. */
async function send(input: FeedbackInput, code: string): Promise<string> {
  if (typeof navigator !== "undefined" && !navigator.onLine) throw new OfflineError();
  if (!API_URL) {
    await new Promise((r) => setTimeout(r, 700));
    return code;
  }

  const body = new FormData();
  body.append("clientCode", code); // lets the backend ignore a queued valuation sent twice
  body.append("portalId", input.portalId);
  body.append("kind", input.kind);
  body.append("rating", String(input.rating));
  body.append("message", input.message);
  if (input.visitDate) body.append("visitDate", input.visitDate);
  if (input.email) body.append("email", input.email);
  if (input.photo) body.append("photo", await dataUrlToBlob(input.photo), "visita.jpg");

  let res: Response;
  try {
    res = await fetch(`${API_URL}${FEEDBACK_ENDPOINT}`, { method: "POST", body });
  } catch {
    throw new OfflineError(); // network failure: same as no signal
  }
  if (!res.ok) {
    const data = await res.json().catch(() => null);
    throw new Error(data?.message ?? "No pudimos enviar tu valoración. Probá de nuevo en unos minutos.");
  }
  const data = await res.json().catch(() => ({}));
  return data.code ?? code;
}

/** Sends now or, without signal, saves it on the device to send later. */
export async function submitFeedback(input: FeedbackInput): Promise<FeedbackResult> {
  const code = newCode();
  try {
    return { code: await send(input, code) };
  } catch (err) {
    if (!(err instanceof OfflineError)) throw err;
    feedbackQueue.write([...feedbackQueue.read(), { code, input, savedAt: new Date().toISOString() }]);
    // write() swallows storage errors (full or blocked), so check it was really saved.
    if (!feedbackQueue.read().some((q) => q.code === code)) throw new Error("No hay señal y no pudimos guardar la valoración en el teléfono. Probá de nuevo más tarde.");
    return { code, queued: true };
  }
}

let flushing = false;

/** Sends every queued valuation; keeps the ones that still fail. Returns how many were sent. */
export async function flushFeedbackQueue(): Promise<number> {
  if (flushing) return 0;
  flushing = true;
  let sent = 0;
  try {
    for (const item of feedbackQueue.read()) {
      try {
        await send(item.input, item.code);
        feedbackQueue.write(feedbackQueue.read().filter((q) => q.code !== item.code));
        sent++;
      } catch (err) {
        if (err instanceof OfflineError) break; // still no signal: try again later
        // Rejected by the server (validation): drop it so it does not block the queue.
        feedbackQueue.write(feedbackQueue.read().filter((q) => q.code !== item.code));
      }
    }
  } finally {
    flushing = false;
  }
  return sent;
}
