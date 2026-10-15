import type { FeedbackInput, FeedbackResult } from "@/types/feedback";

// Endpoint of the IberaReclamos backend. Without NEXT_PUBLIC_API_URL the form works in demo mode (nothing is sent).
const API_URL = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "");
export const FEEDBACK_ENDPOINT = "/api/feedback";

export async function submitFeedback(input: FeedbackInput): Promise<FeedbackResult> {
  if (!API_URL) {
    await new Promise((r) => setTimeout(r, 700));
    return { code: `IB-V${Math.floor(1000 + Math.random() * 9000)}` };
  }

  const body = new FormData();
  body.append("portalId", input.portalId);
  body.append("rating", String(input.rating));
  body.append("message", input.message);
  if (input.email) body.append("email", input.email);
  if (input.photo) body.append("photo", input.photo);

  const res = await fetch(`${API_URL}${FEEDBACK_ENDPOINT}`, { method: "POST", body });
  if (!res.ok) {
    const data = await res.json().catch(() => null);
    throw new Error(data?.message ?? "No pudimos enviar tu valoración. Probá de nuevo en unos minutos.");
  }
  const data = await res.json().catch(() => ({}));
  return { code: data.code ?? data.id ?? "" };
}
