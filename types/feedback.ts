export type Rating = 1 | 2 | 3 | 4 | 5;
export type FeedbackKind = "review" | "suggestion" | "complaint";

/** What a tourist sends from the "Valorar" modal. Mirrors the backend contract (multipart/form-data). */
export interface FeedbackInput {
  portalId: string;
  kind: FeedbackKind;
  rating: Rating;
  message: string;
  /** Day of the visit, YYYY-MM-DD */
  visitDate?: string;
  email?: string;
  /** Compressed JPEG as a data URL (also what the offline queue stores) */
  photo?: string;
}

export interface FeedbackResult {
  /** Reference returned by the backend, or a local one while there is no API */
  code: string;
  /** true when there was no connection: saved on the device and sent later */
  queued?: boolean;
}

export interface QueuedFeedback {
  code: string;
  input: FeedbackInput;
  savedAt: string;
}
